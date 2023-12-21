const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
	postName:String,
	modelName:String,
	postData:mongoose.Schema.Types.Mixed
});

const postModel = mongoose.model("Post", PostSchema);

module.exports = postModel;