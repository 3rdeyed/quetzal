var express	= require('express');
var app		= express();

var fs		= require('fs');
var db		= require('./db/db_json');
var dbTest	= require('./db/db_json_tests');

var port	= process.env.PORT || 8080;


var logGet = function(req, res) {
	console.log('\nGET request: ' + req.url);
	var q = req.query;
	
	if(q.length > 0)
		console.log('QUERY: ' + JSON.stringify(q));
};


app.get('/', function(req, res){
	logGet(req, res);
	var data = db.fetchAll();
	res.json(data);
});
app.get('/all', function(req, res){
	logGet(req, res);
	
	var data = db.fetchAll();
	
	var strData = JSON.stringify(data);
	
	function replaceAll(str, find, replace) {
    	return str.replace(new RegExp(find, 'g'), replace); }
	
	strData = replaceAll(strData, '},"', '},<br>"');
	
	res.send(strData);
});

app.get('/put', function(req, res){
	logGet(req, res);
	
	db.push(req.query, function(id) {
		res.redirect('/');
	});
});

app.get('/set', function(req, res){
	logGet(req, res);
	
	db.set(req.query.id, req.query.key, req.query.value);
	
	res.redirect('/');
});

app.get('/remove', function(req, res){
	logGet(req, res);
	
	var id = req.query.id;
	
	if(id !== undefined)
		db.remove(req.query.id);
	else {
		var key = req.query.key;
		var value = req.query.value;
		console.log('key: ' +key+ ', value: ' +value);
		db.remove(key, value);
	}
	res.redirect('/');
});

app.listen(port, function() {
	console.log('escuchando...');
	
	dbTest.runTests(db);
});

console.log('Quetzal bolando en puerto ' + port);