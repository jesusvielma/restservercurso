require('./config/config')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const path = require('path');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

// public

app.use(express.static(path.resolve(__dirname, '../public')));

app.use(require('./routes/index'))

mongoose.connect(process.env.URLDB, {
            useNewUrlParser: true
        }, (err, res) => {
    if (err) throw err;

    console.log('Base de datos on line');
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ',process.env.PORT);
})


