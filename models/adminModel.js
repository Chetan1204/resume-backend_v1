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
	profileImage:String,
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
	otp:String,
	themeName:String,
	access_token:String,
	websiteName:String,
	websiteUrl:String,
	websiteLogo:String
})

const adminModel = mongoose.model("admin", AdminSchema);

module.exports = adminModel;