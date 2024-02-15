const fs = require("fs").promises;
const path = require("path");

exports.logger = async function (content) {
	await fs.writeFile(path.join(__dirname, '../logs/error-log.txt'), content);
	console.log("error logged in file.")
}