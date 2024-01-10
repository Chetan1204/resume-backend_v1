const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
	email:{
		type:String,
		required:true,
		unique:true
	},
	username:{
		type:String,
		required:true,
		unique:true
	},
	password:{
		type:String,
		required:true,
	},
	roles:[{
		type:String,
		required:true,
		default:"editor"
	}],
	status:{
		type:Boolean,
	},
	access_token:String
})

const adminModel = mongoose.model("admin", AdminSchema);

module.exports = adminModel;