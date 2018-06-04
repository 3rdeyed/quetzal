const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const moment     = require('moment-timezone');       // date & time

const app		= express();

const port	= process.env.PORT || 8080; //3000; // 443


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use( bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));  // public folder
app.use('/favicon.ico', express.static(__dirname + '/public/images/quetzal.ico'));

/*
 * LOGGING
 */

var myLogger = function (req, res, next) {
  var zone = 'America/Mexico_city';
  console.log('\n[' +
              moment().tz(zone).format('hh:mm:ss') +
              '] [REQUEST] ' + req.url);
  next();
};

app.use(myLogger);

/*
 * DATABASE
 */

// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url)
.then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

/*
 * ROUTES
 */

// Require routes
require('./app/routes/routes.js')(app);

/*
 * connect our server
 */
app.listen(port, function() {
	console.log('escuchando...');
	
	//dbTest.runTests(db);
});

console.log('Quetzal bolando en puerto ' + port);
