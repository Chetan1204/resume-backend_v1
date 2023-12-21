const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination:(req, file, cb) => {
		cb(null, path.join(__dirname, "..", "public", "images"))
	},
	filename:(req, file, cb) => {
		const dt = new Date();
		cb(null, `${dt.getFullYear()}_${dt.getMonth()}_${file.originalname}`)
	}
});

const upload = multer({storage:storage});

module.exports = upload;