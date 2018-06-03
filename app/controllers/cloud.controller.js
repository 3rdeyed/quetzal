const Cloud = require('../models/cloud.model.js');
const Note = require('../models/note.model.js');

// -=-=-=-=-=-=- //

/*
 * LOGGING stuff
 */

var log_t0 = null       // timestamp when entering log

// start log

var logIn = function(msg, req, res) {
  log_t0 = Date.now()
  console.log('(logIn cloud.controller) ' + msg) }

// log something

var log = function(msg, req, res) {
  console.log('(log   cloud.controller) ' + msg) }

// end log

var logOut = function(msg, req, res) {
  console.log('(cloud.controller reply [' +(Date.now() - log_t0)+ 'ms]) ' + msg) }

// -=-=-=-=-=-=- //

/*
 *  show all clouds and their notes
 */

exports.showAll = (req, res) => {
  logIn('showAll')
  
  log('[QUERY] find all clouds...')
  
  Cloud.find().populate('items')     // Clound.find().then(clouds => {
    .exec(function(err, clouds) {
      if(err) {
        res.status(500).send({ message: err.message ||
          "Some DB error occurred while showing the clouds."
        })
      }
      
      logOut('index')
      res.render('index', { vars: { clouds: clouds } })
    })
}

/*
 * show one cloud and it's notes or ALL
 */

exports.show = (req, res) => {
  logIn('show')
  
  var cloudId = req.query.cloudId
  
  log('cloudId = ' + cloudId)
  
  Cloud.find().then(clouds => {
    if(cloudId) {
      Cloud.findById(cloudId).then(c => {
        log('cloud.show ITEMS: ' + JSON.stringify(c.items))
        Note.find({ '_id': { $in: c.items }} ).then(notes => {
          logOut('index')
          res.render('index', {
            vars: {
              clouds: clouds,
              notes: notes,
              cloudId: cloudId
            }
          })
        }).catch(err => {
          res.status(500).send({
          message: err.message || "Some error occurred while creating the Cloud."
        })
      })
    })
    } else {
      log('-> show all clouds')
      Note.find().then(notes => {
        
        var idsInCloud = []
        
        for(var c in clouds) {
          var cld = clouds[c]
          for(var i = 0; i < cld.items.length; i++) {
            idsInCloud.push(cld.items[i])
          }
        }
        
        //console.log('ids in clouds: ' + idsInCloud)
        
        for(var n in notes) {
          var note = notes[n]
          //console.log('check note for cloudlessness: ' + note._id)
          
          var isInArray = function (id) {
            for(var ii = 0; ii < idsInCloud.length; ii++) {
              if(idsInCloud[ii].equals(id))
                return true
            }
            return false
          }
          
          // if note id does not appears in array of notes, mark as cloudless
          if(isInArray(note._id)) {
            //console.log(note._id + ' is clouded')
            note.clouded = true
          }
        }
        
        
        logOut('index')
        res.render('index', {
          vars: {
            clouds: clouds,
            notes: notes
          }
        })
      })
      
    }
  })
}

/*
 * Create and Save a new Cloud
 */

exports.create = (req, res) => {
  logIn('create')
  log('req.body: ' + JSON.stringify(req.body));
  
  // Validate request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Cloud name can not be empty"
    });
  }

  // Create a cloud
  const cloud = new Cloud({
    name: req.body.name || "Noname Cloud"
  });

  // Save cloud in the database
  cloud.save()
    .then(data => {
      res.redirect('/');
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Cloud."
      });
    });
};

/*
 * move notes from one cloud to another
 *
 * [params] cloudFrom, cloudTo, noteIds[]
 *
 */

exports.move = (req, res) =>
{
  logIn('move')
  
  // cloud IDs (from, to)
  var cloudFromId = req.body.cloudFrom;
  var cloudToId = req.body.cloudTo;
  
  // IDs of notes we want to move
  var noteIds = req.body.noteIds;
  
  // No note ids? -> throw err
  if(!noteIds) {
    res.send('no note id given')
    return
  }
  
  // LOG
  log('>> move ' + noteIds.length +
              ' notes from cloud [' + cloudFromId + '] ' +
              ' to [' + cloudToId + ']')
  
  /* DB QUERY */
  
  var conditions = { '_id': cloudToId, 'items._id': { $ne: noteIds }}
  var update = { $addToSet: { items: noteIds }}
  
  Cloud.update(conditions, update, function() {
    log('>> > inserted to cloud [' + cloudToId + ']')
  }).then(c => {
    log('>> > insert: ' + c.n + ', modified: ' + c.nModified)
  })
  
  // remove from cloudFromId, if set
  if(cloudFromId) {
    Cloud.update({ _id: cloudFromId }, {
      $pullAll: { "items": noteIds }}, function(err) {
        if(err) {
          log("[ERR] Could not remove [item] from [cloud]")
          res.json(500, { message: "Could not remove [item] from [cloud]" })
        } else {
          logOut('redirect /show?cloudId=' + cloudFromId)
          res.redirect('/show?cloudId=' + cloudFromId)
        }
    });
  }
  else {
    logOut('redirect /show?cloudId=' + cloudFromId)
    res.redirect('/show?cloudId=' + cloudFromId)
  }
  
  /* -=-=-=- */
  
}

/*
 * Helper to remove all notes from clouds
 */

exports._removeNotes = (req, res) => {
  logIn('removeNotes')
  Cloud.update({}, { $set: { items: [] }}, {multi: true}, function(err, affected) {
    if(err) {
      logOut("[ERR] " + err.message)
      res.json(500, { message: "Could not remove items from clouds" })
    }
    else {
      logOut('affected ' + affected)
      res.json(affected)
    }
  })
}


/*

// Retrieve and return all clouds from the database.
exports.findAll = (req, res) => {
  Cloud.find()
    .then(clouds => {
      res.send(clouds);
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving clouds."
      });
    });
};

// Find a single cloud with id
exports.findOne = (req, res) => {
  Cloud.findById(req.params.cloudId)
    .then(cloud => {
      if (!cloud) {
        return res.status(404).send({
          message: "Cloud not found with id " + req.params.cloudId
        });
      }
      res.send(cloud);
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Cloud not found with id " + req.params.cloudId
        });
      }
      return res.status(500).send({
        message: "Error retrieving Cloud with id " + req.params.cloudId
      });
    });
};

// Update a cloud identified by the cloudId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body.content) {
    return res.status(400).send({
      message: "Cloud content can not be empty"
    });
  }

  // Find Cloud and update it with the request body
  Cloud.findByIdAndUpdate(req.params.cloudId, {
      title: req.body.title || "Untitled Cloud",
      content: req.body.content
    }, {
      new: true
    })
    .then(cloud => {
      if (!cloud) {
        return res.status(404).send({
          message: "Cloud not found with id " + req.params.cloudId
        });
      }
      res.send(cloud);
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Cloud not found with id " + req.params.cloudId
        });
      }
      return res.status(500).send({
        message: "Error updating Cloud with id " + req.params.cloudId
      });
    });
};

/*/ // Delete a cloud with the specified cloudId in the request
exports.remove = (req, res) => {
  logIn('remove')
  
  var cloudId = req.query.cloudId;
  
  if(!cloudId) {
    logOut('ERR: no cloud id given')
    return res.status(404).send({
      message: "No cloud ID given."
    }); 
  }
  
  log('removing cloud, id: ' + cloudId)
  
  Cloud.findById(cloudId).then(cloud => {
    if(cloud.items.length > 0) {
      logOut('ERR: cloud not empty')
      return res.status(404).send({
        message: "Cloud with id " + cloudId + " is not empty."
      }); 
    }
    else {
      Cloud.findByIdAndRemove(cloudId)
        .then(cloud => {
            if(!cloud) {
                return res.status(404).send({
                    message: "Cloud not find cloud with id " + cloudId
                });
            }
            res.send({message: "Cloud deleted successfully!"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Could not find cloud with id " + cloudId
                });                
            }
            return res.status(500).send({
                message: "Could not delete Cloud with id " + cloudId
            });
        });
    }
  })
};


/**/