const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
	couponId:String,
	couponCode:String,
	couponDiscount:Number,
	couponDescription:String,
})

const couponModel = mongoose.model("Coupon", CouponSchema);

module.exports = {couponModel, CouponSchema}