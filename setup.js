require('./dbConnect');
const paginate = require('express-paginate');
const Restaurant = require('./restaurant');

function setup(app) {
	app.use(paginate.middleware(10, 100));

	app.get('/restaurants', async (req, res) => {
		const { limit, page = 1 } = req.query;
		const skip = (page - 1) * limit;

		const restaurants = await Restaurant.find().limit(limit).skip(skip);
		const numberOfRestaurants = await Restaurant.count();

		const pages = Math.ceil(numberOfRestaurants / limit);
		res.status(200).json({
			data: restaurants,
			next: paginate.hasNextPages(req)(pages)
				? `/restaurants?page=${page + 1}&limit=${limit}`
				: `/restaurants?page=1&limit=${limit}`,
		});
	});

	app.get('/restaurants/name/:name', async (req, res) => {
		const name = req.params.name;
		const restaurants = await Restaurant.find({ name });
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
		const restaurantData = req.body;
		const id = ''; //vir do body ou dos params
		const rest = await Restaurant.findById(id);
		rest.name = restaurantData.name;
		rest.save();
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
