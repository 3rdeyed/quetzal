var express	= require('express');
var app		= express();

var fs		= require('fs');

var db		= require('./db/db_json');
var dbTest	= require('./db/db_json_tests');

var port	= process.env.PORT || 8080;

/*
 * logging function for GET requests
 */
var logGet = function(req, res) {
	console.log('\nGET request: ' + req.url);
	var q = req.query;
	
	if(q.length > 0)
		console.log('QUERY: ' + JSON.stringify(q));
};

/*
 * root - print out database content
 */
app.get('/', function(req, res){
	logGet(req, res);
	
	var data = db.fetchAll();
	var strData = JSON.stringify(data);
	
	// helper to replace all expressions in a strings
	function replaceAll(str, find, replace) {
    	return str.replace(new RegExp(find, 'g'), replace); }
	
	// add line breaks for better readability
	strData = replaceAll(strData, '},"', '},<br>"');
	
	res.send(strData);
});

/*
 * return database content as json
 */
app.get('/json', function(req, res){
	logGet(req, res);
	var data = db.fetchAll();
	res.json(data);
});

/*
 * add json item to database
 */
app.get('/put', function(req, res){
	logGet(req, res);
	
	db.push(req.query, function(id) {
		res.redirect('/');
	});
});

/*
 * update an existing item in the DB
 * 
 * params: id, key, value
 */
app.get('/set', function(req, res){
	logGet(req, res);
	
	db.set(req.query.id, req.query.key, req.query.value);
	
	res.redirect('/');
});

/*
 * remove an existing item from DB
 * or
 * remove all items whose key equals value
 * 
 * params: id | key, value
 */
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

/*
 * gets called once the server is up
 */
app.listen(port, function() {
	console.log('escuchando...');
	
	dbTest.runTests(db);
});

console.log('Quetzal bolando en puerto ' + port);
