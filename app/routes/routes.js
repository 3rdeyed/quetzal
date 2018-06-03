module.exports = (app) => {
    const main = require('../controllers/main.controller.js');
    const notes = require('../controllers/note.controller.js');
    const clouds = require('../controllers/cloud.controller.js');

  
  
     /**
     *** DEBUGGING
     **/
  
    var log = function(req, res, msg) {
      console.log(msg)
      console.log('body: ', req.body)
      console.log('query: ', req.query)
    }
  
    /**
    *** DEBUG END
    **/
  
    // retrieve all clouds and it's notes
    app.get('/', clouds.show)
    // retrieve all clouds and notes of [cloudId]
    app.get('/show', clouds.show)
    // move notes to cloud
    app.post('/move', clouds.move)
    // show all clouds and their notes
    app.get('/clouds', clouds.showAll)
    // create a new cloud
    app.post('/clouds', clouds.create);
  
  
    // create a new note
    app.post('/notes', notes.create)
  
    /*
     * HELPERS
     */
  
    // app.get('/removeNotes', clouds._removeNotes)
    
    // remove a cloud by id
    app.get('/clouds/remove', clouds.remove)
  
  
    /**
  

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Retrieve a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.put('/notes/:noteId', notes.update);

    // Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);

  
    // Retrieve all Clouds
    app.get('/clouds', clouds.findAll);
  
    
    
    
    /* */
}