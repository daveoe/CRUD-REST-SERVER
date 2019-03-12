require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');
const colors = require('colors');
const path = require('path');
 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Importing Global Routes
app.use(require('./routes/index'));

// Importing public folder
app.use(express.static(path.resolve(__dirname,'../public')));


// Data Base
mongoose.connect(process.env.URLDB, {useNewUrlParser: true, useCreateIndex: true},(err, res) => {
    if (err) throw new err;
    console.log('The Data Base is Online'.cyan);
});


// PORT
app.listen(process.env.PORT, () => {
    console.log('Listening to port: '.white, process.env.PORT.white);
})