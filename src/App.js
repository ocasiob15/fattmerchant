import React, { useEffect } from 'react';
import FattMerchantApi from './apis/FattMerchantApi';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import './App.css';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import Typography from '@material-ui/core/Typography';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { green } from '@material-ui/core/colors';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  detailsRoot: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
}));

const TAX_RATE = 0.07;

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit, id) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price, id };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const variantIcon = {
  success: CheckCircleIcon,
};

function MySnackbarContentWrapper(props) {
  const classes = useStyles();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
};

const useStyles2 = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

function App() {
  const classes = useStyles();
  const fattMerchantApi = new FattMerchantApi();
  const [state, setState] = React.useState({
    data: null,
    loading: true,
    error: false,
    errorMessage: null,
    rows: []
  })

  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    fattMerchantApi.getCatalogItems()
    .then(response => {
      setState({
        data: response,
        loading: false,
        error: false,
        errorMessage: state.errorMessage,
        rows: []
      })
      console.log(response)
    }).catch(error => {
      setState({
        data: null,
        loading: false,
        error: true,
        errorMessage: error,
        rows: []
      })
    })
  }, []);

  if (state.loading) {
    return (
      <div className="App">
        <CircularProgress />
      </div>
    )
  } else if (state.error) {
    return (
      <div className="App">
        <p>An error occurred</p>
        <p>{state.errorMessage}</p>
      </div>
    )
  }

  const columns = [
    {title: "Name", field: "item"},
    {title: "Price(USD)", field: "price", type: 'numeric'},
    {title: "Stock", field: "in_stock"}
  ]
  const invoiceSubtotal = subtotal(state.rows);
  const invoiceTaxes = TAX_RATE * invoiceSubtotal;
  const invoiceTotal = invoiceTaxes + invoiceSubtotal;
  return (
    <div className="App">
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <MySnackbarContentWrapper
          onClose={handleClose}
          variant="success"
          message="Invoice Successfully created!"
        />
      </Snackbar>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MaterialTable
            title="Catalog"
            columns={columns}
            data={state.data.data}
            actions={[
              {
                  icon: AddIcon,
                  tooltip: 'Add Item To Invoice',
                  onClick: (event, rowData) => {
                    if (state.rows.length === 0){
                      state.rows.push(createRow(rowData.item, 1, rowData.price, rowData.id));
                    } else {
                      let found = false
                      state.rows.map(row => {
                        if (row.desc === rowData.item) {
                          row.qty++;
                          row.price = row.unit * row.qty
                          found = true
                        }
                      })
                      if (!found) {
                        state.rows.push(createRow(rowData.item, 1, rowData.price, rowData.id))
                      }
                    }
                    state.rows.map(row => {
                      row.price = row.qty * row.unit
                    })
                    setState({
                      data: state.data,
                      loading: state.loading,
                      error: state.error,
                      errorMessage: state.errorMessage,
                      rows: state.rows
                    })
                  }
              },
              {
                icon: RemoveIcon,
                tooltip: 'Remove Item From Invoice',
                onClick: (event, rowData) => {
                  if (state.rows.length === 0){
                    return
                  } else {
                    let found = false
                    let index = 0;
                    state.rows.map(row => {
                      if (row.desc === rowData.item) {
                        row.qty--;
                        row.price = row.unit * row.qty
                        found = true
                        if (row.qty === 0){
                          state.rows.splice(index, 1);
                        }
                      }
                      index++;
                    })
                    if (!found) {
                      return
                    }
                  }
                  state.rows.map(row => {
                    row.price = row.qty * row.unit
                  })
                  setState({
                    data: state.data,
                    loading: state.loading,
                    error: state.error,
                    errorMessage: state.errorMessage,
                    rows: state.rows
                  })
                }
            }
          ]}
            />
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.detailsRoot}>
            <Typography variant="body1">Invoice</Typography>
            <Table className={classes.table} aria-label="spanning table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={3}>
                    Details
                  </TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Desc</TableCell>
                  <TableCell align="right">Qty.</TableCell>
                  <TableCell align="right">Unit</TableCell>
                  <TableCell align="right">Sum</TableCell>
                </TableRow>
              </TableHead>  
              <TableBody>
                {state.rows.map(row => (
                  <TableRow key={row.desc}>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.unit}</TableCell>
                    <TableCell align="right">{ccyFormat(row.price)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell rowSpan={3} />
                  <TableCell colSpan={2}>Subtotal</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax</TableCell>
                  <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                className={useStyles.submit}
                onClick={() => {
                  const lineItems = state.rows.map(row => {
                    return {
                      id: row.id,
                      item: row.desc,
                      quantity: row.qty,
                      price: row.price
                    }
                  })
                  setState({
                    data: state.data,
                    loading: true,
                    error: state.error,
                    errorMessage: state.errorMessage,
                    rows: state.rows
                  })
                  fattMerchantApi.createInvoice(
                    {
                      customer_id: "acdd7dc5-69a4-4d31-9187-67d50007e8d0",
                      payment_method_id: "68758ae5-ccde-4f95-9dfa-078590a2f070",
                      meta: {
                        tax: invoiceTaxes,
                        subtotal: invoiceSubtotal,
                        lineItems: lineItems
                      },
                      total: invoiceTotal,
                      url: "https://omni.fattmerchant.com/#/bill/",
                      send_now: false,
                      files: []
                    }
                  ).then(() => {
                    setOpen(true)
                    state.rows = []
                    setState({
                      data: state.data,
                      loading: state.loading,
                      error: state.error,
                      errorMessage: state.errorMessage,
                      rows: state.rows
                    })
                  })
                }}
            >
                Create Invoice
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
