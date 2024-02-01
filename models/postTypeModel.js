const mongoose = require("mongoose");

const PostTypeSchema = new mongoose.Schema({
	postTypeName:{
		type:String,
		required:true,
		unique:true
	},
	customField:[{
		type:String
	}],
	customFieldId:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"datas",
		sparse:true
	}],
	postTypeSlug:{
		type:String,
		unique:true
	},
	postCount:{
		type:Number,
		default:0
	},
	pin:{
		type:Boolean
	}
},{
	timestamps:true
});

const postTypeModel = mongoose.model("PostType", PostTypeSchema);

module.exports = postTypeModel;