const mongoose = require('mongoose');

const CloudSchema = mongoose.Schema({
    name: String,
    items: [{ type: mongoose.Schema.ObjectId, ref: 'Note' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cloud', CloudSchema);