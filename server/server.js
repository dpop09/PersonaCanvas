const express = require('express')
const cors = require('cors')
const app = express()
const routes = require('./routes')
const botApp = require('./node_bot_backend/bot');
const emailRouter = require('./sendEmail')
app.use(express.static('public/fonts'));

app.use(express.json()) // **dpop09** Enable JSON parsing for incoming requests
app.use(cors({ origin: '*' })) // **dpop09** Use CORS middleware to allow cross-origin requests
require('dotenv').config();

app.use('/', routes)    // **dpop09** all routes are mounted on the root path

botApp.use(express.json());
app.use('/bot', botApp);

emailRouter.use(express.json());
app.use('/emailRouter', emailRouter);

//start running server on port 3001
app.listen(3001, () => {
    console.log("Node.js server started on port 3001.")
})