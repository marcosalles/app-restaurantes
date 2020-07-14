const express = require('express');
const setup = require('./setup');

const app = express();
app.use(express.json());

setup(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log('Houston, we have a server!');
});
