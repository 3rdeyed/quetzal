const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const moment     = require('moment-timezone');       // date & time

const app		= express();

const port	= process.env.PORT || 8080; //3000; // 443

/*
 * MODELS 
 */

const Note = require('./app/models/note.model.js');
const Cloud = require('./app/models/cloud.model.js');

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(require('connect').bodyParser);
// parse requests of content-type - application/json
app.use( bodyParser.json());


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



/*app.post('*', (res, req) => {
  console.log('POST')
  console.log('body: ', req.body)
  console.log('query: ', req.query)
  res.json({a:'POST'});
})
app.get('*', (res, req) => {
  console.log('GET');
  console.log('body: ', req.body)
  console.log('query: ', req.query)
  res.send('gotcha!')
  res.json({a:'GET'});
})*/


/*
 * root - index
 *
app.get('/', function(req, res){
  var t0 = Date.now()
  
  Cloud.find().then(clouds => {
    Note.find().then(notes => {
      console.log('(' + (Date.now() - t0) + 'ms)');

      res.render('index', {
        vars: {
          clouds: clouds,
          notes: notes
        }
      })
    })
  })
})*/


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


// Require Notes routes
require('./app/routes/routes.js')(app);

/*
 * gets called once the server is up
 */
app.listen(port, function() {
	console.log('escuchando...');
	
	//dbTest.runTests(db);
});

console.log('Quetzal bolando en puerto ' + port);
