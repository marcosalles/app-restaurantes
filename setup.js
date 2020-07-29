require('./dbConnect');
const uuid = require('uuid');
const Restaurant = require('./restaurant');
const User = require('./usuario.modelo');
const Log = require('./log');

async function isAuthorized(req, res, url) {
	const token = req.header('Token');
	const user = await User.findOne({ token });
	if (!user) {
		res.status(401).json({ message: 'Acesso negado: token inválido' });
		return false;
	}
	new Log({ userId: user._id, url, payload: req.body, date: new Date() }).save();
	return true;
}

function setup(app) {

	app.get('/signup', (req, res) => {
		res.status(200).json({usage: 'Send a POST with an \'email\' attribute in its body'});
	});

	app.post('/signup', async (req, res) => {
		const email = (req.body || {}).email;
		if (!email) {
			res.status(400).json({usage: 'Send a body with an \'email\' attribute'});
			return;
		}
		// finge que a gente validou que é um email

		const user = await User.findOne({ email: email });
		if (user) {
			res.status(200).json({ message: 'Usuário ja existente', token: user.token });
			return;
		}

		const token = uuid.v4();
		const newUser = new User({
			email: email,
			token: token,
		});

		newUser.save()
			.then(() => {
				res.status(201).json({ message: 'Aqui está seu token de acesso', token: token });
			})
			.catch((error) => {
				res.status(400).json({ message: error.message });
			});
	});

	app.get('/restaurants', async (req, res) => {
		if (!await isAuthorized(req, res, 'GET /restaurants')) return;
		const limit = parseInt(req.query.limit);
		const page = parseInt(req.query.page);

		const skip = (page - 1) * limit;
		
		const restaurants = await Restaurant.find().limit(limit).skip(skip);
		const numberOfRestaurants = await Restaurant.countDocuments();

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
		if (!await isAuthorized(req, res, `GET /restaurants/name/${name}`)) return;

		const restaurants = await Restaurant.find({ name: name });
		if (!restaurants || restaurants.length == 0) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurants);
		}
	});

	app.get('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		if (!await isAuthorized(req, res, `GET /restaurant/${id}`)) return;

		const restaurant = await Restaurant.findById(id);
		if (!restaurant) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurant);
		}
	});

	app.post('/restaurant', async (req, res) => {
		if (!await isAuthorized(req, res, 'POST /restaurant')) return;

		const restaurant = new Restaurant(req.body);
		restaurant.save().then(() => {
			res.status(200).json(restaurant);
		})
		.catch(error => {
			res.status(500).json({ status: 500, message: error.message });
		})
	});

	app.put('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		if (!await isAuthorized(req, res, `PUT /restaurant/${id}`)) return;

		const restaurantData = req.body;
		
		delete restaurantData._id;

		const restaurant = await Restaurant.findById(id);
		if (!restaurant) {
			res.status(404).json({ message: 'Restaurante a ser atualizado não foi encontrado' });
			return;
		}

		Object.keys(restaurantData).forEach(key => restaurant[key] = restaurantData[key]);

		restaurant.save().then(() => {
			res.status(200).json(restaurant);
		})
		.catch(error => {
			res.status(500).json({ status: 500, message: error.message });
		})
	});

	app.delete('/restaurant/:id', async (req, res) => {
		const id = req.params.id;
		if (!await isAuthorized(req, res, `DELETE /restaurant/${id}`)) return;

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

	app.get('/', (req, res) => {
		res.status(200).json({
			openRoutes: {
				'GET    /signup': 'Instructions on how to signup.',
				'POST   /signup': 'Send an email to get a token.',
			},
			closedRoutes: {
				'GET    /restaurants': 'Query all restaurants. Params: limit, page.',
				'GET    /restaurants/name/:name': 'Query all restaurants by name.',
				'GET    /restaurant/:id': 'Query a restaurant by id.',
				'POST   /restaurant': 'Create a new restaurant.',
				'PUT    /restaurant/:id': 'Update a restaurant by id.',
				'DELETE /restaurant/:id': 'Remove a restaurant by id.',
			},
			access: 'To access the closed routes, you must provide a Header named \'Token\' with your own token as its value',
		})
	});
}

module.exports = setup;
