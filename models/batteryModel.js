const mongoose = require("mongoose");


const BatterySchema = new mongoose.Schema({
	brand:{
		type:String,
		required:true
	},
	subBrand:String,
	name:{
		type:String,
		required:true
	},
	warranty:{
		type:Number
	},
	batteryCategory:{type:String, required:true},
	batteryType:{type:String},
	capacity:{type:Number, required:true},
	mrp:{type:Number, required:true},
	specialPrice:{type:Number, required:true},
	stock:{type:Number, required:true},
	priceWithOldBattery:{type:Number, required:true},
	priceWithoutOldBattery:{type:Number, required:true},
	offers:[String],
	features:[String],
	description:String,
	specifications:{type:String, required:true},
	recommendedFor:[String],
	discount:Number,
	batteryImages:[String]
});

const batteryModel = mongoose.model("Battery", BatterySchema);

module.exports = { batteryModel }