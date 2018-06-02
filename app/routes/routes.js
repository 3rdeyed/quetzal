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
  
    // Retrieve all Clouds and it's Notes
    app.get('/', clouds.show)
  
    // retrieve all clouds and notes of [cloudId]
    app.get('/show', clouds.show)
  
    // Create a new Note
    app.post('/notes', notes.create)
  
    // Move notes to cloud
    app.post('/move', clouds.move)
  
    /**
  

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Retrieve a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.put('/notes/:noteId', notes.update);

    // Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);

  
    // Create a new Cloud
    app.post('/clouds', clouds.create);

    // Retrieve all Clouds
    app.get('/clouds', clouds.findAll);
  
    
    
    
    /* */
}