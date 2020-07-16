const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: { type: String, required: true },
	token: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
// user => users => db.users

module.exports = User;
