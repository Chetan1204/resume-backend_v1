const mongoose = require("mongoose");
const {CategorySchema} = require('./categoryModel');

const PostSchema = new mongoose.Schema({
	postType:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"PostTypes"
	},
	postName:String,
	customField:[String],
	category:[CategorySchema],
	defaultPostTitle:String,
	defaultPostContent:String,
	postData:mongoose.Schema.Types.Mixed,
	status:{
		type:String,
		enum:["published", "draft"]
	},
	revisions:{
		type:Number,
		default:0
	},
	visibility:{
		type:String,
		enum:["visible", "hidden"]
	},
	permaLink:{
		type:String,
		required:false,
		default:"/"
	}
},{
	timestamps:true
});

const postModel = mongoose.model("Post", PostSchema);

module.exports = postModel;