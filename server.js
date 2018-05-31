const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const moment     = require('moment-timezone');       // date & time

const app		= express();

/////////////////
const fs		= require('fs');

/*
 * MODELS 
 */

const Note = require('./app/models/note.model.js');

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));  // public folder
app.use('/favicon.ico', express.static(__dirname + '/public/images/favicon.ico'));
//app.engine('html', require('ejs').renderFile);
//app.set('views', __dirname + '/views');



var myLogger = function (req, res, next) {
  var zone = 'America/Mexico_city'; //moment.tz.guess()
  console.log('\n[' +
              moment().tz(zone).format('hh:mm:ss') +
              '] [REQUEST] ' + req.url);
  next();
};

app.use(myLogger);


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


var port	= process.env.PORT || 8080;


app.get('/x', function(req, res){
  var html = "<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>Hello World!</h1>\n   </body>\n</html>";

  res.render(html);
});
  
/*
 * root - index
 */
app.get('/', function(req, res){
  var t0 = Date.now();
  
  Note.find()
    .then(notes => {
      //var strData = JSON.stringify(notes);
      //console.log('>>>' + strData);
    
      console.log('(' + (Date.now() - t0) + 'ms)');
    
      res.render('index', {
        vars: {
          notes: notes
        } });
  });
});

/*
 * print out database content
 */
app.get('/print', function(req, res){
	
  Note.find()
    .then(notes => {
      var strData = JSON.stringify(notes);

      // helper to replace all expressions in a strings
      function replaceAll(str, find, replace) {
          return str.replace(new RegExp(find, 'g'), replace); }

      // add line breaks for better readability
      strData = replaceAll(strData, ',"', ',<br>"');
      strData = replaceAll(strData, ',{', ',<br><br>{');

      res.send(strData);
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving notes."
      });
    });
});

/*
 * return database content as json
 *
app.get('/json', function(req, res){
	logGet(req, res);
	var data = db.fetchAll();
	res.json(data);
});
*/

/*
 * add json item to database
 *
app.get('/put', function(req, res){
	logGet(req, res);
	
	db.push(req.query, function(id) {
		res.redirect('/');
	});
});
*/

/*
 * update an existing item in the DB
 * 
 * params: id, key, value
 *
app.get('/set', function(req, res){
	logGet(req, res);
	
	db.set(req.query.id, req.query.key, req.query.value);
	
	res.redirect('/');
});
*/

/*
 * remove an existing item from DB
 * or
 * remove all items whose key equals value
 * 
 * params: id | key, value
 *
app.get('/remove', function(req, res){
	logGet(req, res);
	
	var id = req.query.id;
	
	if(id !== undefined)
		db.remove(req.query.id);
	else {
		var key = req.query.key;
		var value = req.query.value;
		// debug logging
		console.log('key: ' +key+ ', value: ' +value);
		db.remove(key, value);
	}
	res.redirect('/');
});
*/

// Require Notes routes
require('./app/routes/note.routes.js')(app);

/*
 * gets called once the server is up
 */
app.listen(port, function() {
	console.log('escuchando...');
	
	//dbTest.runTests(db);
});

console.log('Quetzal bolando en puerto ' + port);
