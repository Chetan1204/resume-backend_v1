const mongoose =  require('mongoose');

const PricingManagerSchema = new mongoose.Schema({
	productId: {
		type:mongoose.Schema.Types.ObjectId,
		ref:"posts"
	},
	pricingAndAvailability: [{
		location:String,
		mrp:String,
		changeFactor:String,
		isAvailable:Boolean,
	}]
})

const pricingManagerModel = mongoose.model("Pricing", PricingManagerSchema);

module.exports = {pricingManagerModel}