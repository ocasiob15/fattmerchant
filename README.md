# fattmerchant
Code test for Fattmerchant

# How to run
simply run "npm install"
then execute the command "npm start"

This project utilizes the material-ui library for graphics.
This was all done in a hurry, but with a goal in mind. Due to Cross Origin Resource
Sharing(CORS) problem with the sandbox API. A wrapper serverless microservice was created in python as a backend/middleware alternative to get around this issue. 
There for the API that this project speaks with is a microservie that communicates
with the fattmerchant API and has the CORS preflight request endpoints necessary
to make this micro webapp function. A Material Table was utilized to display the catalog of products returned from fattmerchant and a table was utlized to create the invoice. These were all modified templates from material-ui. When an invoice is successfully submitted a small pop up will appear on the bottom left corner of the screen notifing the user of the successful invoice creation. A user can add or remove items in increments of 1. No error popups were made. This was kept simple to show off a simple feature as fast as possible.

