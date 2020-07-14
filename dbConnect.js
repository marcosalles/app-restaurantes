const mongoose = require('mongoose');

mongoose.connect(
	'mongodb://127.0.0.1:27017/restaurantes',
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.once('open', () => console.log('Houston, we have a connection!'));

module.exports = db;
