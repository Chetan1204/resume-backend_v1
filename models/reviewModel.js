const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
	productId:{
		type:String,
		required:true
	},
	reviewScore:{
		type:Number,
		required:true
	},
	reviewerName:{
		type:String,
		required:true
	},
	reviewContent:String
});

const reviewModel = mongoose.model("Reviews", ReviewSchema);

module.exports = { reviewModel }