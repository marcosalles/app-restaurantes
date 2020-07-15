require('./dbConnect');
const Restaurant = require('./restaurant');

function setup(app) {

	app.get('/restaurants', async (req, res) => {
		const limit = parseInt(req.query.limit);
		const page = parseInt(req.query.page);
		const skip = (page - 1) * limit;
		console.log(limit, page, skip);
		
		const restaurants = await Restaurant.find().limit(limit).skip(skip);
		const numberOfRestaurants = await Restaurant.count();

		const result = {
			data: restaurants,
		};
		const hasNextPage = Math.ceil(numberOfRestaurants / limit) > page;
		if (hasNextPage) {
			result.nextPage = `http://localhost:3000/restaurants?limit=${limit}&page=${page + 1}`;
		}

		res.status(200).json(result);
	});

	app.get('/restaurants/name/:name', async (req, res) => {
		const name = req.params.name;
		const restaurants = await Restaurant.find({ name: name });
		if (!restaurants || restaurants.length == 0) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurants);
		}
	});

	app.get('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		const restaurant = await Restaurant.findOne({ _id: id });
		if (!restaurant) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurant);
		}
	});

	app.post('/restaurant', async (req, res) => {
		const restaurant = new Restaurant(req.body);
		await restaurant.save().then(() => {
			res.status(200).json(restaurant);
		})
		.catch(error => {
			res.status(500).json({ status: 500, message: error.message });
		})
	});

	app.put('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		const restaurantData = req.body;
		
		delete restaurantData._id;

		const restaurant = await Restaurant.findById(id);
		if (!restaurant) {
			res.status(404).json({ message: 'Restaurante a ser atualizado não foi encontrado' });
			return;
		}

		if (restaurantData.name != undefined) restaurant.name = restaurantData.name;
		if (restaurantData.borough != undefined) restaurant.borough = restaurantData.borough;
		if (restaurantData.cuisine != undefined) restaurant.cuisine = restaurantData.cuisine;
		
		// Object.keys(restaurantData).forEach(key => restaurant[key] = restaurantData[key]);

		await restaurant.save().then(() => {
			res.status(200).json(restaurant);
		})
		.catch(error => {
			res.status(500).json({ status: 500, message: error.message });
		})
	});

	app.delete('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		await Restaurant.deleteOne({ _id: id })
			.then((result) => {
				if (result.deletedCount > 0) {
					res.status(200);
				} else {
					res.status(404);
				}
				res.json();
			}).catch((error) => {
				res.status(500).json({ status: 500, message: error.message });
			});
	});

}

module.exports = setup;
