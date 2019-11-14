
class FattMerchantApi {

    baseEndpoint = "https://tzk4q7s8fk.execute-api.us-east-1.amazonaws.com/dev/store"

    async getCatalogItems() {
        const extension = "/catalog"
        return fetch(this.baseEndpoint + extension,
        {
            method: "GET",
            credentials: "same-origin",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .catch(error => {throw error})
    }

    async createInvoice(request) {
        const extension = "/checkout/invoice"
        return fetch(this.baseEndpoint + extension,
        {
            method: "POST",
            credentials: "same-origin",
            body: JSON.stringify(request),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .catch(error => {throw error})
    }

}

export default FattMerchantApi;