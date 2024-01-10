const pageModel = require('../models/pageModel');
const postModel = require('../models/postModel');
const dataModel = require('../models/dataModel');
const postTypeModel = require("../models/postTypeModel");
const { categoryModel } = require('../models/categoryModel');
const { v4: uuidv4 } = require('uuid');
// const mongoose = require("mongoose");
// mongoose.set('debug', true);

exports.dashboard = async (req, res) => {
	res.render('dashboard');
}

exports.getPostTypesAndLinks = async (req, res) => {
	try {
		
		const postTypes = await postTypeModel.find({ pin: true });
		return res.status(200).json({ success: true, data: postTypes });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.renderAllPostTypes = async (req, res) => {
	try {
		
		const allPostTypes = await postTypeModel.find({});
		res.render("allposttypes", {
			allPostTypes
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.linkPostType = async (req, res) => {
	try {
		
		const { linkPostTypeName, linkPostTypeId, linkModelId } = req.body;
		const postType = await postTypeModel.findOne({ _id: linkPostTypeId, postTypeName: linkPostTypeName });
		if (postType) {
			const model = await dataModel.findOne({ _id: linkModelId });
			postType.customField.push(model?.modelName);
			postType.customFieldId.push(model?._id);
			await postType.save();
			res.redirect(`/api/v1/manage/rendermodel?modelname=${encodeURIComponent(model?.modelName)}`);
		} else {
			res.status(400).json({ success: false, message: "post type not found" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.unlinkPostType = async (req, res) => {
	try {
		
		const { postTypeId, postTypeName, modelId } = req.body;
		const postType = await postTypeModel.findOne({ _id: postTypeId, postTypeName: postTypeName });
		if (postType) {
			const model = await dataModel.findOne({ _id: modelId });
			postType.customField = postType.customField.filter(item => item !== model?.modelName);
			postType.customFieldId = postType.customFieldId.filter(item => !item.equals(model?._id));
			await postType.save();
			const affectedPosts = await postModel.find({ postType: postType?._id });
			for (const affectedPost of affectedPosts) {
				affectedPost.customField = affectedPost.customField.filter(item => item !== model?.modelName);
				await affectedPost.save();
			}
			res.status(200).json({ succes: true });
		} else {
			res.status(400).json({ success: false, message: "post type not found" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.pinPostType = async (req, res) => {
	try {
		
		const { postTypeName, postTypeId, pin } = req.body;
		const postType = await postTypeModel.findOne({ _id: postTypeId, postTypeName });
		if (postType) {
			postType.pin = pin;
			await postType.save();
			res.status(200).json({ success: true, message: "post-type pinned." })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error })
	}
}

exports.pinCustomField = async (req, res) => {
	try {
		
		const { modelName, modelId, pin } = req.body;
		const model = await dataModel.findOne({ _id: modelId, modelName });
		if (model) {
			model.pin = pin;
			await model.save();
			res.status(200).json({ success: true, message: "post-type pinned." })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.createPost = async (req, res) => {
	try {
		
		const { postTypeId, postName } = req.body;
		const postType = await postTypeModel.findOne({ _id: postTypeId });
		const newPost = new postModel({
			postType: postType?._id,
			postName,
			customField: postType?.customField || undefined
		});
		postType.postCount += 1;
		await postType.save();
		await newPost.save();
		res.status(200).json({ success: true, message: "post created" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.allPages = async (req, res) => {
	try {
		
		const allPages = await pageModel.find({});
		res.render("all", { allPages, message: req.flash("toast") })
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}

exports.addNewPage = async (req, res) => {
	try {
		
		res.redirect("/api/v1/manage/all-pages?addnewmodal=true");
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}

exports.saveFields = async (req, res) => {
	try {
		
		const { pageName, data } = req.body;
		const page = await pageModel.findOne({ name: pageName });
		if (!page) {
			return res.status(404).json({ message: 'Page not found' });
		}
		page.data = data;
		await page.save();
		res.status(200).json({ message: 'Fields saved successfully' });
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.checkNameAttr = async (req, res) => {
	try {
				
		const { ejsPageName, elementAttrName, sectionName } = req.body;
		let flag = true;
		const pageMatch = await pageModel.findOne({ name: ejsPageName });
		for (let section of pageMatch.sections) {
			if (section?.sectionName === sectionName) {
				for (let content of section?.sectionContent) {
					if (content.elementAttrName === elementAttrName) {
						flag = false;
					}
				}
			}
		}
		if (flag) {
			res.status(200).json({ success: true, message: "check success" })
		} else {
			res.status(400).json({ success: false, message: "Element with the same name attribute already exists" })
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.allPosts = async (req, res) => {
	try {
		
		let filteringByModel = undefined;
		if (req.query?.filterbymodel) {
			filteringByModel = req.query?.filterbymodel;
		}
		const allPostsData = filteringByModel ? await postModel.find({ modelName: filteringByModel }) : await postModel.find({})
		const allModels = await dataModel.find({});
		const sanitizedModelData = allModels.map(item => ({
			modelName: item.modelName
		}))
		res.render("allposts", { allPosts: allPostsData, allModels: sanitizedModelData });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.renderAddPostType = async (req, res) => {
	try {
		
		const allModels = await dataModel.find({});
		res.render("addNewPostType", { allModels })
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deletePost = async (req, res) => {
	try {
		
		const { postName, postId } = req.body;
		const match = await postModel.findOneAndDelete({ _id: postId });
		if (match) {
			const postType = await postTypeModel.findOne({ _id: match?.postType });
			allPosts = await postModel.find({ postType: postType?._id }).countDocuments();
			postType.postCount = allPosts;
			await postType.save();
			res.status(200).json({ success: true, message: "post deleted" })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addNewPostType = async (req, res) => {
	try {
		
		const { postTypeName, postTypeSlug } = req.body;
		const newPostType = new postTypeModel({
			postTypeName: postTypeName,
			postTypeSlug: postTypeSlug,
		});
		await newPostType.save();
		res.redirect("/api/v1/manage/render-all-post-types");
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.showPosts = async (req, res) => {
	try {
		
		const posts = await postModel.find({ postType: req.params.posttypeid });
		const postType = await postTypeModel.findOne({ _id: req.params.posttypeid });
		const allModels = await dataModel.find({});
		res.render("allposts", {
			allPosts: posts,
			allModels,
			postTypeName: postType.postTypeName,
			postTypeId: req.params.posttypeid
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deletePostType = async (req, res) => {
	try {
		
		const { postTypeName, postTypeId } = req.body;
		const match = await postTypeModel.findOneAndDelete({ postTypeName, _id: postTypeId }, { new: true });
		if (match) {
			await postModel.deleteMany({ postType: postTypeId });
			res.status(200).json({ success: true, message: "post-type and its posts deleted" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addPostData = async (req, res) => {
	try {
		const { postName, modelName, postTypeId, ...postData } = req.body;
		const existingPost = await postModel.findOne({ postName, postType: postTypeId });
		if (postTypeId) {
			const postType = await postTypeModel.findOne({ _id: postTypeId });
			if (postType) {
				if (!postType?.customField?.length > 0 || !postType?.customFieldId?.length > 0) {
					existingPost.defaultPostTitle = postData?.defaultPostTitle;
					existingPost.defaultPostContent = postData?.defaultPostContent;
					existingPost.postData = {};
					existingPost.revisions = existingPost.revisions + 1;
					existingPost.status = "published";
					await existingPost.save();
					return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
				} else {
					const fileObject = {};
					for (let item of postType?.customFieldId) {
						const modelReference = await dataModel.findOne({ _id: item });
						if (!modelReference) return res.status(500).json({ success: false, message: "Cannot find model information. exiting." });
						req.files.forEach(fileItem => {
							if (modelReference.dataObject[fileItem.fieldname] === 'Image') {
								fileObject[fileItem.fieldname] = fileItem.filename;
							} else if (modelReference.dataObject[fileItem.fieldname] === 'Multiple Images') {
								if (existingPost?.postData[fileItem.fieldname]) {
									fileObject[fileItem.fieldname] = [...existingPost.postData[fileItem.fieldname], fileItem.filename]
								} else {
									fileObject[fileItem.fieldname] = [fileItem.filename]
								}
							}
						});
					}
					if (!existingPost?.postData) {
						existingPost.postData = {
							...postData,
							...fileObject
						}
					} else {
						existingPost.postData = {
							...existingPost?.postData,
							...postData,
							...fileObject
						}
					}
					existingPost.customField = postType?.customField;
					existingPost.revisions = existingPost.revisions + 1;
					existingPost.status = "published";
					await existingPost.save();
					return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
				}
			} else {
				return res.status(400).json({ success: false, message: "cannot find the post-type" });
			}
		} else {
			return res.status(400).json({ success: false, message: "cannot find the post-type" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

exports.addPageArrayItem = async (req, res) => {
	try {
		const {ejsPageName, sectionName, arrayItemNamePointer, itemType} = req.body;
		const data = {
			id: uuidv4(),
			type:itemType,
			value: itemType === 'Image' ? req.files[0]?.filename : req.body?.itemValue
		}
		const match = await pageModel.findOneAndUpdate({name:ejsPageName, 'sections.sectionName':sectionName, 'sections.sectionContent.elementAttrName':arrayItemNamePointer}, {
			$push:{
				'sections.$.sectionContent.$[elem].elementItems': data
			}
		}, {new:true, arrayFilters: [{ 'elem.elementAttrName': arrayItemNamePointer }]})
		res.status(200).json({data:req.body})
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.deletePageArrayItem = async (req, res) => {
	try {
		const {ejsPageName, sectionName, arrayName, itemId} = req.body;
		const match = await pageModel.findOneAndUpdate(
			{
				name:ejsPageName,
				'sections.sectionName':sectionName,
				'sections.sectionContent.elementAttrName': arrayName,
				'sections.sectionContent.elementItems.id': itemId
			},
			{
				$pull:{
					'sections.$[chosenSection].sectionContent.$[chosenElement].elementItems':{id:itemId}
				}
			},
			{
				new:true,
				arrayFilters:[
					{'chosenSection.sectionName':sectionName},
					{'chosenElement.elementAttrName':arrayName},
				]
			}
		);
		res.status(200).json({success:true, data:match});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.updatePageItemTextContent = async (req, res) => {
	try {
		const {ejsPageName, sectionName, arrayName, itemId, itemValue} = req.body;
		const doc = await pageModel.findOne({name:ejsPageName});
		if(doc){
			const match = await pageModel.findOneAndUpdate(
				{
					name:ejsPageName,
					'sections.sectionName': sectionName,
					'sections.sectionContent.elementAttrName': arrayName,
					'sections.sectionContent.elementItems.id': itemId
				}, 
				{
					$set: {
						'sections.$[section].sectionContent.$[elementItem].elementItems.$[item].value': itemValue
					}
				}, 
				{
					new:true, 
					arrayFilters: [
						{ 'section.sectionName': sectionName },
						{ 'elementItem.elementAttrName': arrayName },
						{ 'item.id': itemId }
					],
				});

			res.status(200).json({success:true, message:"ok", data:match})
		} else {
			res.status(400).json({success:false, message:"data not found"});
		}

	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.addPostArrayItem = async (req, res) => {
	try {
		const { postName, postTypeId, arrayItemNamePointer, itemType, itemValue } = req.body;
		let treatedItemValue;
		if (itemType === "String" || itemType === "Textarea") {
			treatedItemValue = itemValue;
		} else if (itemType === "JSON") {
			treatedItemValue = JSON.parse(itemValue);
		} else if (itemType === "Image") {
			treatedItemValue = req.files[0].filename;
		}
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, {
			$push: {
				[`postData.${arrayItemNamePointer}`]: { id: uuidv4(), type: itemType, value: treatedItemValue }
			},
		}, { new: true });
		if (!post) return res.status(400).json({ successs: false, message: "cannot find post data" });
		return res.status(200).json({ success: true })
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.addPostRepeaterItem = async (req, res) => {
	try {
		const {postName, postTypeId, repeaterName, ...postData} = req.body;
		console.log(req.body);
		console.log(req.files);
		req.files.forEach(item => {
			postData[item.fieldname] = item.filename
		})
		console.log("##################\n", postData);
		const post = await postModel.findOneAndUpdate({postName, postType:postTypeId},{
			$push:{
				[`postData.${repeaterName}`]:postData,
			}
		},{new:true})
		res.status(200).json({success:true, data:post});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.addPostRepeaterArrayItem = async (req, res) => {
	try {
		const {postName, postTypeId, repeaterName, arrayName, itemType, itemValue } = req.body;
		console.log("Adding repeater array item", req.body);
		console.log("Adding repeater array item files", req.files);
		let treatedItemValue;
		if (itemType === "String" || itemType === "Textarea") {
			treatedItemValue = itemValue;
		} else if (itemType === "JSON") {
			treatedItemValue = JSON.parse(itemValue);
		} else if (itemType === "Image") {
			treatedItemValue = req.files[0].filename;
		}
		const post = await postModel.findOneAndUpdate({postName, postType:postTypeId}, {
			$push:{
				[`postData.${repeaterName}.${arrayName}`]:{
					id:uuidv4(),
					type:itemType,
					value:treatedItemValue
				}
			}
		})
		res.status(200).json({success:true});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.deletePostArrayItem = async (req, res) => {
	try {
		
		const { postName, postTypeId, arrayName, itemId } = req.body;
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, {
			$pull: {
				[`postData.${arrayName}`]: { id: itemId }
			}
		}, { new: true });
		res.status(200).json({ success: true });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.updatePostArrayItem = async (req, res) => {
	try {
		
		const { postName, postTypeId, arrayName, arrayIndex, itemId, itemType, itemValue } = req.body;
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId, [`postData.${arrayName}.id`]: itemId }, {
			$set: { [`postData.${arrayName}.$.value`]: itemValue }
		});

		await post.save();
		res.status(200).json({ success: true })
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.orderPageArrayItem = async (req, res) => {
	try {
		const {ejsPageName, sectionName, arrayItemNamePointer, order} = req.body;
		const doc = await pageModel.findOne({name:ejsPageName});
		if(doc){
			const rearrangedArray = order.map(id => {
				const foundSection = doc.sections.filter((item, index) => (item?.sectionName === sectionName))[0];
				const foundElementItems = foundSection.sectionContent.filter((item)=>(item?.elementAttrName === arrayItemNamePointer))[0]?.elementItems;
				const foundObject = foundElementItems.filter(item => item?.id === id)[0];
				return foundObject || null; // Handle the case where an ID is not found
			});
			const match = await pageModel.findOneAndUpdate({name:ejsPageName, 'sections.sectionName':sectionName, 'sections.sectionContent.elementAttrName':arrayItemNamePointer}, {
				$set:{
					'sections.$.sectionContent.$[elem].elementItems': rearrangedArray
				}
			}, {new:true, arrayFilters: [{ 'elem.elementAttrName': arrayItemNamePointer }]})
			
			res.status(200).json({success:true, data:match});
		} else {
			return res.status(400).json({success:false, message:"unable to find the page."});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.orderPostArrayItem = async (req, res) => {
	try {
		
		const { postName, postTypeId, arrayItemNamePointer, order } = req.body;
		const doc = await postModel.findOne({ postName, postType: postTypeId });
		if (doc) {
			const rearrangedArray = order.map(id => {
				const foundObject = doc.postData[arrayItemNamePointer].find(obj => obj.id === id);
				return foundObject || null;
			});
			const result = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, {
				$set: {
					[`postData.${arrayItemNamePointer}`]: rearrangedArray
				}
			}, { new: true })
		}
		return res.status(200).json({ success: true })
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.createPostCategory = async (req, res) => {
	try {
		const { postName, postTypeId, newCategoryName } = req.body;
		const categoryMatch = await categoryModel.findOne({ categoryName: newCategoryName });
		if (categoryMatch) return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
		const newCategory = new categoryModel({
			categoryName: newCategoryName
		});
		await newCategory.save();
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, { $push: { 'category': newCategory } }, { new: true });
		if (!post) return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
		await post.save();
		res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.addPostCategory = async (req, res) => {
	try {
		const { postName, postTypeId, postCategoryIdSelect } = req.body;
		const categoryMatch = await categoryModel.findOne({ _id: postCategoryIdSelect });
		if (!categoryMatch) return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, { $addToSet: { 'category': categoryMatch } }, { new: true });
		await post.save();
		return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.unlinkCategory = async (req, res) => {
	try {
		
		const { categoryId, postName, postTypeId } = req.body;
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId }, {
			$pull: {
				category: { _id: categoryId }
			}
		}, { new: true });
		await post.save();
		res.status(200).json({ success: true });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.showPost = async (req, res) => {
	try {
		
		const encodedPostName = req.query.postname;
		const encodedPostId = req.query.postid;
		const postName = decodeURIComponent(encodedPostName);
		const postTypeId = decodeURIComponent(encodedPostId);
		const postType = await postTypeModel.findOne({ _id: postTypeId });
		const post = await postModel.findOne({ postName: postName, postType: postTypeId });
		const allCategories = await categoryModel.find({});
		if (postType && postType?.customField?.length > 0) {
			let dataObject = {};
			let modelNames = [];
			async function processAllCustomFields(items) {
				for (const item of items) {
					const model = await dataModel.findOne({ modelName: item });
					if (model) {
						let modifiedDataObject = {}; 
						for( let item of Object.keys(model?.dataObject)) {
							if(typeof(model?.dataObject[item]) == 'string'){
								modifiedDataObject[item] = model?.dataObject[item]
							} else if(typeof(model?.dataObject[item]) == 'object') {
								const modelMatch = await dataModel.findOne({_id:model?.dataObject[item]?.linkedModel})
								modifiedDataObject[item] = { value:"Repeater", data:{...modelMatch.dataObject}}
							}
						}
						dataObject = { ...dataObject, ...modifiedDataObject };
						modelNames.push(model?.modelName)
					}
				}
			}
			await processAllCustomFields(postType?.customField);
			res.render('post', {
				postTypeId,
				postId: post?._id,
				postName: postName,
				dataObject: dataObject,
				postData: post.postData,
				revisions: post.revisions,
				status: post.status,
				visibility: post.visibility,
				modelName: modelNames,
				customFields: postType.customField,
				customFieldIds: postType.customFieldId,
				category: post?.category || [],
				allCategories,
			});
		} else {
			res.render('post', {
				postTypeId,
				postId: post?._id,
				postName: postName,
				dataObject: {},
				revisions: post.revisions,
				status: post.status,
				visibility: post.visibility,
				defaultPostTitle: post.defaultPostTitle,
				defaultPostContent: post.defaultPostContent,
				modelName: [""],
				customFields: [],
				customFieldIds: [],
				category: [],
				allCategories,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.renderaddNewModel = async (req, res) => {
	try {
		
		res.render("newmodel", {
			message: "Let us create a new model."
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addNewModel = async (req, res) => {
	try {
		
		const { modelName, modelSlug } = req.body;
		const match = await dataModel.findOne({ modelName: modelName });
		if (match) {
			return res.redirect("newmodel", {
				error: {
					status: true,
					message: "Model with the same name already exists"
				}
			})
		} else {
			const newDataModel = new dataModel({
				modelName,
				modelSlug,
				dataObject: {}
			});
			await newDataModel.save();
			res.redirect(`/api/v1/manage/rendermodel?modelname=${encodeURIComponent(modelName)}`);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deleteModel = async (req, res) => {
	
	const { modelName } = req.body;
	const model = await dataModel.findOneAndDelete({ modelName })
	res.status(200).json({ success: true, message: "Model deleted." })
}

exports.renderModel = async (req, res) => {
	try {
		
		const encodedModelName = req.query.modelname;
		if (!encodedModelName) {
			return res.redirect("/add-new-model");
		} else {
			const decodedModelName = decodeURIComponent(encodedModelName);
			const dataMatch = await dataModel.findOne({ modelName: decodedModelName });
			const allModels = await dataModel.find({}).select('modelName _id');
			const linkedPostTypes = await postTypeModel.find({ customFieldId: dataMatch?._id });
			const allPostTypes = await postTypeModel.find({});
			res.render("model", {
				modelData: dataMatch,
				linkedPostTypes,
				allPostTypes,
				allModels:allModels
			})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.allModels = async (req, res) => {
	try {
		
		const allModels = await dataModel.find({});
		res.render("allmodels", { allModels });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.getAllModelNamesAndLinks = async (req, res) => {
	try {
		const allModels = await dataModel.find({ pin: true });
		const sanitizedData = allModels.map(item => ({ modelName: item.modelName }));
		res.status(200).json({ success: true, data: sanitizedData });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.addModelData = async (req, res) => {
	try {
		const { modelName, modelData } = req.body;
		const existingData = await dataModel.findOne({ modelName });
		if (!existingData) {
			return res.status(400).json({ success: false, message: 'Model not found.' });
		}
		const filteredModelData = Object.fromEntries(
			Object.entries(modelData).filter(([key]) => key.trim() !== '')
		);
		existingData.dataObject = { ...filteredModelData };
		await existingData.save();
		res.status(200).json({ success: true, updatedData: existingData });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.linkModelRepeater = async (req, res) => {
	try {
		const {modelId, fieldName, linkingModelId} = req.body;
		console.log("Request Body::",req.body);
		const existingModel = await dataModel.findOneAndUpdate({_id:modelId}, {
			[`dataObject.${fieldName}`]:{
				value:"Repeater",
				linkedModel:linkingModelId
			}
		}, {new:true});
		console.log(existingModel);
		res.status(200).json({success:true, message:"repeater linked"});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.savePageData = async (req, res) => {
	try {
		let data = {};
		const postData = req.body;
		const pageMatch = await pageModel.findOne({ name: postData.ejsPageName });
		if (pageMatch) {
			pageMatch.pageDefaultTitle = postData.pageDefaultTitle;
			pageMatch.pageDefaultContent = postData.pageDefaultContent;
			const postDataSections = JSON.parse(postData.sections);
			postDataSections.forEach(postDataSectionItem => {
				pageMatch.sections.map(pageSectionItem => {
					if (pageSectionItem.sectionName === postDataSectionItem.sectionName) {
						pageSectionItem.sectionContent = pageSectionItem.sectionContent.map(pageSectionContentItem => {
							const temp = postDataSectionItem.sectionContent.filter(postSectionContentItem => postSectionContentItem.elementAttrName === pageSectionContentItem.elementAttrName)[0];
							if (temp) {
								if (temp.elementAttrSrcImg) {
									temp.elementAttrSrcImg = req.files.filter(item => item.originalname === temp.elementAttrSrcImg)[0]?.filename;
								}
								return { ...pageSectionContentItem, ...temp }
							} else {
								return pageSectionContentItem;
							}
						})
						return pageSectionItem;
					} else {
						return pageSectionItem;
					}
				})
			})
			pageMatch.status = 'published';
			pageMatch.visibility = 'visible';
			pageMatch.revisions += 1; 
			await pageMatch.save();
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false, message: "Unable to get page data" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removePage = async (req, res) => {
	try {
		
		const { ejsPageName } = req.body;
		await pageModel.findOneAndDelete({ name: ejsPageName });
		res.status(200).json({ sucess: true, message: "Page deleted successfully" });
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removePageSection = async (req, res) => {
	try {
		
		const { ejsPageName, sectionName } = req.body;
		const pageMatch = await pageModel.findOne({ name: ejsPageName });
		if (pageMatch) {
			pageMatch.sections = pageMatch.sections.filter(section => section.sectionName !== sectionName);
			await pageMatch.save();
			res.status(200).json({ success: true, message: "Page section removed" });
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removeSectionElement = async (req, res) => {
	try {
		
		const { ejsPageName, sectionName, elementAttrName } = req.body;
		const pageMatch = await pageModel.findOne({ name: ejsPageName });
		if (pageMatch) {
			pageMatch.sections.map(section => {
				if (section?.sectionName === sectionName) {
					section.sectionContent = section.sectionContent.filter(item => item?.elementAttrName !== elementAttrName);
					return section;
				} else {
					return section;
				}
			});
			await pageMatch.save();
			res.status(200).json({ success: true });
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addSection = async (req, res) => {
	try {
		
		const { ejsPageName, sectionName } = req.body;
		const match = await pageModel.findOne({ name: ejsPageName });
		if (!match) return res.status(400).json({ success: false, message: "Unable to get page data" });
		for (let item of match.sections) {
			if (item.sectionName === sectionName) {
				return res.status(400).json({ success: false, message: "Section with same name already exists" })
			}
		}
		match.sections.push({
			sectionName: sectionName
		});
		await match.save();
		res.status(200).json({ success: true });
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addButton = async (req, res) => {
	try {
		
		const { ejsPageName, sectionNamePointer, buttonNamePointer, buttonTitle, buttonLink } = req.body;
		const match = await pageModel.findOne({ name: ejsPageName });
		if (match) {
			match.sections = match.sections.map(section => {
				if (section.sectionName === sectionNamePointer) {
					section.sectionContent = section.sectionContent.map(element => {
						if (element.elementAttrName === buttonNamePointer) {
							element.elementAttrHref = buttonLink;
							element.elementValue = buttonTitle;
							return element;
						} else {
							return element;
						}
					})
					return section;
				} else {
					return section;
				}
			});
			match.revisions +=1;
			await match.save();
			res.status(200).json({ success: true })
		} else {
			res.status(400).json({ success: false })
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addLink = async (req, res) => {
	try {
		
		const { ejsPageName, sectionNamePointer, buttonNamePointer, linkTitle, linkHref } = req.body;
		const match = await pageModel.findOne({ name: ejsPageName });
		if (match) {
			match.sections = match.sections.map(section => {
				if (section.sectionName === sectionNamePointer) {
					section.sectionContent = section.sectionContent.map(element => {
						if (element.elementAttrName === buttonNamePointer) {
							element.elementAttrHref = linkHref;
							element.elementValue = linkTitle;
							return element;
						} else {
							return element;
						}
					})
					return section;
				} else {
					return section;
				}
			});
			match.revisions += 1;
			await match.save();
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addElement = async (req, res) => {
	try {
		const { ejsPageName, sectionName, elementData } = req.body;
		const sanitizedPageName = ejsPageName.replace(/\s/g, '-');
		if (ejsPageName) {
			const pageMatch = await pageModel.findOne({ name: ejsPageName });
			if (pageMatch) {
				pageMatch.sections.map(item => {
					if (item.sectionName === sectionName) {
						item.sectionSlug = sectionName.toLowerCase().split(" ").join("-") + "-section-slug";
						item.sectionContent.push(elementData);
						return item;
					} else return item;
				})
				await pageMatch.save();
				res.status(200).json({ success: true });
			} else {
				res.status(400).json({ success: false, message: "Cannot find the page data." });
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error occurred while adding element." });
	}
}

