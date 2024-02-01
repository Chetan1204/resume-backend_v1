const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
	modelName:{
		type:String,
		required:true
	},
	modelSlug:String,
	description:String,
	pin:Boolean,
	dataObject:{
		type:mongoose.Schema.Types.Mixed,
		required:true
	}
},{
	timestamps:true
})

const dataModel = new mongoose.model("data", DataSchema);

module.exports = dataModel;