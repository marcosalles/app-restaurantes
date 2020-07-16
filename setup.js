require('./dbConnect');
const uuid = require('uuid');
const Restaurant = require('./restaurant');
const User = require('./usuario.modelo');

async function isAuthorized(req, res) {
	const token = req.header('Token');
	const user = await User.findOne({ token });
	if (!user) {
		res.status(401).json({ message: 'Acesso negado: token inválido' });
		return false;
	}
	return true;
}

function setup(app) {

	app.post('/signup', async (req, res) => {
		const email = req.body.email;
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
		if (!await isAuthorized(req, res)) return;

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
		if (!await isAuthorized(req, res)) return;

		const name = req.params.name;
		const restaurants = await Restaurant.find({ name: name });
		if (!restaurants || restaurants.length == 0) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurants);
		}
	});

	app.get('/restaurant/:id', async (req, res) => {
		if (!await isAuthorized(req, res)) return;

		const id = req.params.id;
		const restaurant = await Restaurant.findById(id);
		if (!restaurant) {
			res.status(404).json();
		} else {
			res.status(200).json(restaurant);
		}
	});

	app.post('/restaurant', async (req, res) => {
		if (!await isAuthorized(req, res)) return;

		const restaurant = new Restaurant(req.body);
		await restaurant.save().then(() => {
			res.status(200).json(restaurant);
		})
		.catch(error => {
			res.status(500).json({ status: 500, message: error.message });
		})
	});

	app.put('/restaurant/:id', async (req, res) => {
		if (!await isAuthorized(req, res)) return;

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
		if (!await isAuthorized(req, res)) return;

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
