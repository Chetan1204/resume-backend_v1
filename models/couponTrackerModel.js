const mongoose = require("mongoose");

const CouponTrackerSchema = new mongoose.Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	couponsUsed:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Coupon"
	}]
})

const couponTrackerModel = mongoose.model("Coupontracker", CouponTrackerSchema);

module.exports = { couponTrackerModel }