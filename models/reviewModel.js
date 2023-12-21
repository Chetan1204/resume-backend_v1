const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
	item:{
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

const reviewModel = mongoose.model("Review", ReviewSchema);

module.exports = { reviewModel }