const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
	id:{type: String, required:true},
	receipt:{type: String, required:true},
})

const orderModel = mongoose.model("Order", OrderSchema);

module.exports = {orderModel}