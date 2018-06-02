const Cloud = require('../models/cloud.model.js');
const Note = require('../models/note.model.js');

exports.show = (req, res) => {
  var t0 = Date.now()
  
  var cloudId = req.query.cloudId
  
  console.log('cloudId = ' + cloudId)
  
  Cloud.find().then(clouds => {
    if(cloudId) {
      Cloud.findById(cloudId).then(c => {
        console.log('cloud.show ITEMS: ' + JSON.stringify(c.items))
        Note.find({ '_id': { $in: c.items }} ).then(notes => {
          console.log('(' + (Date.now() - t0) + 'ms)');

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
      console.log('-> show all clouds')
      Note.find().then(notes => {
        console.log('(' + (Date.now() - t0) + 'ms)');

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


// Create and Save a new Cloud
exports.create = (req, res) => {
  console.log('create: ' + JSON.stringify(req.body));
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
// Delete a cloud with the specified cloudId in the request
exports.delete = (req, res) => {
  Cloud.findByIdAndRemove(req.params.cloudId)
    .then(cloud => {
        if(!cloud) {
            return res.status(404).send({
                message: "Cloud not found with id " + req.params.cloudId
            });
        }
        res.send({message: "Cloud deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Cloud not found with id " + req.params.cloudId
            });                
        }
        return res.status(500).send({
            message: "Could not delete Cloud with id " + req.params.cloudId
        });
    });
};

*/

exports.move = (req, res) =>
{
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
  console.log('>> move ' + noteIds.length +
              ' notes from cloud [' + cloudFromId + '] ' +
              ' to [' + cloudToId + ']')
  
  /* DB QUERY */
  
  var conditions = { '_id': cloudToId, 'items._id': { $ne: noteIds }}
  var update = { $addToSet: { items: noteIds }}
  
  Cloud.update(conditions, update, function() {
    console.log('>> > inserted to cloud [' + cloudToId + ']')
  }).then(c => {
    console.log('>> > insert: ' + c.n + ', modified: ' + c.nModified)
  })
  
  // remove from cloudFromId, if set
  if(cloudFromId) {
    Cloud.update({ _id: cloudFromId }, {
      $pullAll: { "items": noteIds }}, function(err) {
        if(err) {
          console.log("[ERR] Could not remove [item] from [cloud]")
          res.json(500, { message: "Could not remove [item] from [cloud]" })
        } else {
          console.log('redirect')
          res.redirect('/show?cloudId=' + cloudFromId)
        }
    });
  }
  else
    res.redirect('/show?cloudId=' + cloudFromId)
  
  /* -=-=-=- */
  
}

/**/