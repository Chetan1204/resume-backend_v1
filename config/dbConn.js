const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://127.0.0.1:27017/univbackend'

async function Connectdb() {
	try {
		await mongoose.connect(MONGODB_URL)
	} catch (error) {
		console.log("Failed to connect to the database\n ------ERROR------\n", error)
	}
       
}

module.exports = { Connectdb };
