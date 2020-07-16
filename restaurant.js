const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
	name: { type: String, required: true },
	borough: String,
	cuisine: String,
	restaurant_id: Number,
	grades: [{
		date: { type: Date, default: Date.now },
		grade: String,
		score: Number,
	}],
	address: {
		street: String,
		building: Number,
		zipcode: Number,
		coord: [Number, Number],
	},
});
restaurantSchema.methods.greetClient = function() {
	console.log(`Boas vindas ao ${this.name}! Posso te ajudar?`);
}
restaurantSchema.statics.findByCuisine = function(cuisine) {
	return this.find({ cuisine: cuisine });
}
restaurantSchema.statics.findByName = function(name) {
	return this.find({ name: name });
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
// restaurants

module.exports = Restaurant;
