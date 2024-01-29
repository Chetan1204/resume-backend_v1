const mongoose = require('mongoose')

const ElementSchema = new mongoose.Schema({
	elementName:String,
	elementLabelName:String,
	elementClass:String,
	elementAttrName:String,
	elementAttrId:String,
	elementAttrType:String,
	elementAttrFor:String,
	elementValue:String,
	elementAttrHref:String,
	elementAttrChecked:Boolean,
	elementAttrFileMultiple:String,
	elementAttrSrcImg:String,
	elementAttrAltImg:String,
	elementAttrIsEditor:Boolean,
	elementItems:[mongoose.Schema.Types.Mixed]
})

const PageSchema = new mongoose.Schema({
    name: String,
	revisions:{
		type:Number,
		default:0
	},
	status:{
		type:String,
		enum:['published', 'draft']
	},
	visibility:{
		type:String,
		enum:['visible', 'hidden']
	},
    author: String,
	pageDefaultTitle:String,
	pageDefaultContent:String,
    sections:[{
		sectionName:{
			type:String,
		},
		sectionSlug:{
			type:String
		},
		sectionContent:[ElementSchema]
	}]
},{timestamps:true})



const pageModel = mongoose.model('Page', PageSchema);

module.exports = pageModel;