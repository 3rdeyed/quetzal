const Cloud = require('../models/cloud.model.js');
const Note = require('../models/note.model.js');


// Create and Save a new Note
exports.allNotes = (req, res) => {
  console.log('allNotes: ', req.query);
  
  var t0 = Date.now();
  
  Cloud.find().then(clouds => {
    console.log('CLOUDS')
    Note.find().then(notes => {
      console.log('NOTES')
      console.log('(' + (Date.now() - t0) + 'ms)')

      res.render('index', {
        vars: {
          clouds: clouds,
          notes: notes
        }
      })
    })
  })
}