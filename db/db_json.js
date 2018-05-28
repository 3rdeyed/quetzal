var fs		= require('fs');

/*
 * first test database in variable
 * 
 *var db =
{
	'0' : {
			'nombre': 'Quetzal',
			'tipo': 'Pacharo'
			},
	'1' : {
			'nombre': 'Aguilar',
			'tipo': 'Pacharo'
			},
	'2' : {
			'nombre': 'Conejo',
			'tipo': 'Mamal'
			},
}; */

var dbFile = 'db/db.json';
var db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));


var DB_DEBUG = true;

var log = function(msg) {
	if(DB_DEBUG) {
		console.log('[JSON DB] ' + msg);
	}
};

/*
 * save database to file
 */
var saveDB = function() {
	fs.writeFileSync(dbFile, JSON.stringify(db), 'utf8');
	log('database saved to file');
};

function countProps(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

/*
 * module functions
 */

module.exports = {
	fetchAll: function () {
		log('fetchAll() -> items: ' + countProps(db));
		return db;
	},
	fetch: function(key, value)
	{
		if(value !== undefined)
		{
			log('fetch(' +key+ ', ' +value+ ')');
			var results = new Array();
			
			// iterate through all db objects
			for(var o in db) {
				// if key matches add to results
				//log('check if ' +db[o][key]+ ' equals ' +value);
				if(db[o][key] == value)
					results.push(key);
			}
			
			return results;
		}
		else
		{
			var id = key;
			log('fetch(' +id+ ')');
			return db[id];
		}
	},
	push: function (obj, callback)		// push object to db, return uniqueId
	{
		log('push(obj): ' + obj);
		let cb = callback;
		
		genId(7, function(uniqueId)
		{
			// update db object
    		db[uniqueId] = obj;
    		// update db file
    		saveDB();
    		log('object added @ unique id #' + uniqueId);
    		
    		cb(uniqueId);
		});
	},
	set: function(id, field, value)
	{
		log('set(' +id+ ', ' +field+ ', ' +value+ ')');
		db[id][field] = value;
		saveDB();
	},
	remove: function(key, value)	// returns number of items removed
	{
		if(value !== undefined)
		{
			log('remove(' +key+ ', ' +value+ ')');
			
			var nRemoved = 0;
			
			for(o in db) {
				if(db[o][key] == value)
				{
					log(JSON.stringify(db[o]));
					delete db[o];
					nRemoved++;
				}
			}
			
			saveDB();
			log('items removed: ' + nRemoved);
			return nRemoved;
		}
		else {
			var id = key;
			log('remove(' +id+ ')');
			delete db[id];
			saveDB();
			return 1;
		}
	}
};

/*
 * generate unique id (source: google)
 */ 
var genId = function(count, k) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';

    for(var i = 0; i < count; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    
    if(db[str] == null) // check if id exists, if not -> callback
    	k(str);
    else
    	genId(count, k);  // otherwise, recurse on generate
};