const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
	categoryName:String,
})

const categoryModel = mongoose.model("category", CategorySchema);

module.exports = {categoryModel, CategorySchema};