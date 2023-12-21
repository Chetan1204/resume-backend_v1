const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
	categoryName:{
		type:String,
		required:true
	}
})

const ModelSchema = new mongoose.Schema({
	brandName:String,
	name:String,
});

const BrandSchema = new mongoose.Schema({
	brandName:String, 
	brandLogo:String,
	subBrands:[String],
	models:[ModelSchema],
	brandDescription:String,
	brandFeatures:String,	
	category:String
});



const brandModel = mongoose.model("Brand", BrandSchema);
const modelModel = mongoose.model("Model", ModelSchema);
const categoryModel = mongoose.model("Category", CategorySchema);

module.exports = { brandModel, modelModel, categoryModel }