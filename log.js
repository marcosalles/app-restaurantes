const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	url: { type: String, required: true },
	payload: Object,
	date: Date
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
