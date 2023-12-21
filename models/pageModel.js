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
	elementAttrIsEditor:Boolean
})

const PageSchema = new mongoose.Schema({
    name: String,
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
})



const pageModel = mongoose.model('Page', PageSchema);

module.exports = pageModel;