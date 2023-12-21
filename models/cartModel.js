const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	transcationId:{type:String, default:""},
	items:[]
});

const cartModel = mongoose.model("Cart", CartSchema);

module.exports = { cartModel }