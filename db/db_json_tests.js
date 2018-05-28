module.exports = {
	runTests: function(db)
	{
		var log = function(msg) {
			console.log('[DB TEST] ' + msg);
		};
		
		// number of tests failed
		var nFailed = 0;
		
		// check if two objects or values are equal
		var checkEqual = function(obj1, obj2, msg) {
			var res = (obj1 === obj2);
			log('check equality - ' +msg+ ' - ' +obj1+ ' = ' +obj2+ ' -> ' + res);
			
			if(res == false) {				
				log('>>> TEST FAILED <<<');
				nFailed++;
			}
		};
		
		
		log('>>> START JSON DB TEST ...');
		
		
		var newObj = {
			'name': 'Apple',
			'type': 'fruit'
		};
		
		log('push new object: ' + JSON.stringify(newObj));
		
		db.push(newObj, function(id)
		{	
			log('id returned: ' + id);
			log('check if object arrived in db...');
			var obj = db.fetch(id);
			
			log('object: ' + JSON.stringify(obj));
			checkEqual(newObj, obj, "pushed object");
			log('set object type...');
			
			db.set(id, 'type', 'computer');
			
			obj = db.fetch(id);
			
			log('object: ' + JSON.stringify(obj));
			checkEqual(newObj.type, obj.type, "pushed object type");
			
			log('remove object...');
			
			db.remove(id);
			obj = db.fetch(id);
			
			log('object: ' + JSON.stringify(obj));
			checkEqual(obj, undefined, "received object is undefined");
		});
		
		/*
		 * push various objects
		 */
		var type = 'test_369_humano';
		var newObjs = [
			{name: 'Jose', type: type},
			{name: 'Juan', type: type},
			{name: 'Hans', type: type}
		];
		
		var q = db.fetch('type', type);
		checkEqual(q.length, 0, 'test type does not exist');
		
		var nCreated = 0;
		var callback = function(id) {
			if(++nCreated == newObjs.length)
			{
				var res = db.fetch('type', type);
				
				checkEqual(res.length, newObjs.length, 'all objects created?');
				
				var nRemoved = db.remove('type', type);
				
				checkEqual(res.length, nRemoved, 'all objects removed?');
			}
		};
		
		for(i = 0; i < newObjs.length; i++)
			db.push(newObjs[i], callback);
		
		if(nFailed > 0)
			log('FINISHED - tests failed: ' + nFailed);
		else
			log('FINISHED - ALL GOOD!');
	}
};