const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,
    content: String,
    cloudId: mongoose.Schema.Types.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema);