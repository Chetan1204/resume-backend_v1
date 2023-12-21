const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	firstName:{
		type:String,
		required:true
	},
	lastName:{
		type:String,
	},
	email:{
		type:String,
		required:true
	},
	phone:{
		type:String,
		required:true
	},
	addressLineOne:{
		type:String,
		required:true
	},
	addressLineTwo:{
		type:String,
	},
	state:{
		type:String,
		required:true
	},
	city:{
		type:String,
		required:true
	},
	pinCode:{
		type:Number,
		required:true
	},
	country:{
		type:String,
		required:true
	},
	password:{
		type:String,
		required:true
	}
});

const userModel = mongoose.model("User", UserSchema);

module.exports = { userModel }