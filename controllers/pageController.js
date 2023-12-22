const pageModel = require('../models/pageModel');
const postModel = require('../models/postModel');
const dataModel = require('../models/dataModel')

exports.dashboard = async(req,res)=>{
    res.render('dashboard')
}


exports.allPages =  async (req, res) => {
    try {
        const allPages = await pageModel.find({});
        res.render("all",{allPages})
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.addNewPage =  async (req, res) => {
    try {
        const allPages = await pageModel.find({});
        res.redirect("/manage/all-pages?addnewmodal=true");
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.saveFields = async (req, res) => {
  const { pageName, data } = req.body;
  try {
      const page = await pageModel.findOne({ name: pageName });

      if (!page) {
          return res.status(404).json({ message: 'Page not found' });
      }

      // Update or add the fields in the page document
      page.data = data;

      // Save the updated page document
      await page.save();

      res.status(200).json({ message: 'Fields saved successfully' });
  } catch (error) {
      console.error('Error saving fields:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.allPosts = async (req, res) =>{
	try {
		let filteringByModel = undefined;
		if(req.query?.filterbymodel){
			filteringByModel = req.query?.filterbymodel;
		}
		const allPostsData = filteringByModel ? await postModel.find({modelName:filteringByModel}) : await postModel.find({})
		const allModels = await dataModel.find({});
		const sanitizedModelData = allModels.map(item => ({
			modelName:item.modelName
		}))
        res.render("allposts",{allPosts:allPostsData, allModels:sanitizedModelData});
	} catch (error) {
		console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
	}
} 

exports.renderAddPost = async (req, res) => {
	try {
		const allModels = await dataModel.find({});
        res.render("addNewPost",{allModels})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deletePost = async (req, res) => {
	try {
		const {postName, postId} = req.body;
		console.log("Deleting a post", req.body);
		const match = await postModel.findOneAndDelete({_id:postId});
		if(match){
			res.redirect("/manage/all-posts");
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addNewPost = async (req, res) => {
	try {
		const {postName, modelName} = req.body;
		const model = await dataModel.findOne({modelName:modelName});
		if(model){
			res.render('post', {
				postName:postName,
				modelName:modelName,
				dataObject:model.dataObject,
				postData:null
			})
		} else {
			res.status(400).json({success:false, message:'model not found'});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addPostData = async (req, res) => {
    try {
        const { postName,modelName, postData } = req.body;
		const existingPost = await postModel.findOne({ postName });
		if (existingPost) {
            existingPost.postData = postData;
            await existingPost.save();
        } else {
            await postModel.create({
                postName,
                modelName,
                postData,
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


exports.showPost = async (req, res) => {
	try {
		const encodedPostName = req.query.postname;
		const postName = decodeURIComponent(encodedPostName);
		const post = await postModel.findOne({postName:postName});
		const modelName = await dataModel.findOne({modelName:post.modelName});
		if(modelName){
			res.render('post', {
				postName:postName,
				dataObject:modelName.dataObject,
				postData:post.postData,
				modelName:modelName
			})
		} else {
			res.status(400).json({success:false, message:'model not found'});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.renderaddNewModel = async (req, res) => {
	try {
		res.render("newmodel", {
			message:"Let us create a new model."
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addNewModel = async (req, res) => {
	try {
		const {modelName, modelSlug} = req.body;
		const match = await dataModel.findOne({modelName:modelName});
		if(match){
			return res.redirect("newmodel", {
				error:{
					status:true,
					message:"Model with the same name already exists"
				}
			})
		} else {
			const newDataModel = new dataModel({
				modelName,
				modelSlug,
				dataObject: {}
			})
			await newDataModel.save();
			res.redirect(`/manage/rendermodel?modelname=${encodeURIComponent(modelName)}`)
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.renderModel = async (req, res) => {
	try {
		const encodedModelName = req.query.modelname;
		if(!encodedModelName) {
			return res.redirect("/manage/add-new-model");
		} else {
			const decodedModelName = decodeURIComponent(encodedModelName);
			const dataMatch = await dataModel.findOne({modelName:decodedModelName});
			res.render("model", {
				modelData:dataMatch
			})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
exports.allModels = async (req, res) =>{
	try {
		const allModels = await dataModel.find({});
        res.render("allmodels",{allModels})
	} catch (error) {
		console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
	}
} 
exports.getAllModelNamesAndLinks = async (req, res) =>{
	try {
		const allModels = await dataModel.find({});
		const sanitizedData = allModels.map(item => ({modelName: item.modelName}));
		res.status(200).json({success:true, data:sanitizedData});
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
            return res.status(404).json({ success: false, message: 'Model not found.' });
        }
		const filteredModelData = Object.fromEntries(
            Object.entries(modelData).filter(([key]) => key.trim() !== '')
        );

        existingData.dataObject = { ...existingData.dataObject, ...filteredModelData };

        await existingData.save();

        console.log("Adding Model Data", existingData);
        res.status(200).json({ success: true, updatedData: existingData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



exports.savePageData = async (req, res) => {
	try {
		let data = {};
		const postData = req.body;
		console.log(postData);
		console.log("request files ===>",req.files);
		const pageMatch = await pageModel.findOne({name:postData.ejsPageName});
		if(pageMatch){
			pageMatch.pageDefaultTitle = postData.pageDefaultTitle;
			pageMatch.pageDefaultContent = postData.pageDefaultContent;
			const postDataSections = JSON.parse(postData.sections);
			postDataSections.forEach(postDataSectionItem => {
				pageMatch.sections.map(pageSectionItem => {
					if(pageSectionItem.sectionName === postDataSectionItem.sectionName){
						pageSectionItem.sectionContent = pageSectionItem.sectionContent.map(pageSectionContentItem => {
							console.log("POST",postDataSectionItem.sectionContent);
							console.log("PAGE",pageSectionContentItem);

							const temp = postDataSectionItem.sectionContent.filter(postSectionContentItem => postSectionContentItem.elementAttrName === pageSectionContentItem.elementAttrName)[0];
							if(temp){
								if(temp.elementAttrSrcImg){
									temp.elementAttrSrcImg = req.files.filter(item => item.originalname === temp.elementAttrSrcImg)[0]?.filename;
								}
								return {...pageSectionContentItem, ...temp}
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
			await pageMatch.save();
			res.status(200).json({success:true});
		} else {
			res.status(400).json({success:false, message:"Unable to get page data"})
		}
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removePage = async (req, res) => {
	try {
		// get ejsPageName from req.body, delete that page
		const {ejsPageName} = req.body;
		const match = await pageModel.findOneAndDelete({name:ejsPageName});
		res.status(200).json({sucess:true, message:"Page deleted successfully"})
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removePageSection = async (req, res) => {
	try {
		// get ejs page name and section name that we want to remove
		const {ejsPageName, sectionName} = req.body;
		const pageMatch = await pageModel.findOne({name:ejsPageName});
		if(pageMatch) {
			pageMatch.sections =  pageMatch.sections.filter(section => section.sectionName !== sectionName);
			await pageMatch.save();
			res.status(200).json({success:true, message:"Page section removed"})
		}
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.removeSectionElement = async (req, res) => {
	try {
		const {ejsPageName, sectionName, elementAttrName} = req.body;
		const pageMatch = await pageModel.findOne({name:ejsPageName});
		if(pageMatch) {
			pageMatch.sections.map(section => {
				if(section?.sectionName === sectionName){
					section.sectionContent = section.sectionContent.filter(item => item?.elementAttrName !== elementAttrName);
					return section;
				} else {
					return section;
				}
			});
			await pageMatch.save();
			res.status(200).json({success:true});
		}
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addSection = async (req, res) => {
	try {
		const {ejsPageName, sectionName} = req.body;
		console.log("ADDING SECTION", req.body);
		const match = await pageModel.findOne({name:ejsPageName});
		if(!match) return res.status(400).json({success:false, message:"Unable to get page data"});
		match.sections.push({
			sectionName:sectionName
		});
		await match.save();
		res.status(200).json({success:true});
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addButton = async (req, res) => {
	try {
		console.log("Adding button", req.body);
		const {ejsPageName, sectionNamePointer, buttonNamePointer, buttonTitle, buttonLink} = req.body;
		const match = await pageModel.findOne({name:ejsPageName});
		if(match) {
			match.sections = match.sections.map(section => {
				if(section.sectionName === sectionNamePointer){
					section.sectionContent = section.sectionContent.map(element => {
						if( element.elementAttrName === buttonNamePointer){
							element.elementAttrHref = buttonLink;
							element.elementValue = buttonTitle;
							return element;
						} else {
							return element;
						}
					})
					return section;
				} else{
					return section;
				}
			});
			await match.save();
			res.status(200).json({success:true})
		} else {
			res.status(400).json({success:false})
		}
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addLink = async (req, res) => {
	try {
		console.log("Adding button", req.body);
		const {ejsPageName, sectionNamePointer, buttonNamePointer, linkTitle, linkHref} = req.body;
		const match = await pageModel.findOne({name:ejsPageName});
		if(match) {
			match.sections = match.sections.map(section => {
				if(section.sectionName === sectionNamePointer){
					section.sectionContent = section.sectionContent.map(element => {
						if( element.elementAttrName === buttonNamePointer){
							element.elementAttrHref = linkHref;
							element.elementValue = linkTitle;
							return element;
						} else {
							return element;
						}
					})
					return section;
				} else{
					return section;
				}
			});
			await match.save();
			res.status(200).json({success:true})
		} else {
			res.status(400).json({success:false})
		}
	} catch (error) {
		console.error('Error saving fields:', error);
      	res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addElement = async (req, res) => {
	try {
		const {ejsPageName, sectionName, elementData} = req.body;
		console.log("ADDING ELEMENT BODY", req.body);	
		const sanitizedPageName = ejsPageName.replace(/\s/g, '-');
		if(ejsPageName){
			const pageMatch = await pageModel.findOne({name:ejsPageName});
			if(pageMatch){
				pageMatch.sections.map(item => {
					if(item.sectionName === sectionName){
						item.sectionSlug = sectionName.toLowerCase().split(" ").join("-")+"-section-slug";
						item.sectionContent.push(elementData);
						return item;
					} else return item
				})
				await pageMatch.save();
				res.status(200).json({success:true})
			} else {
				res.status(400).json({success:false, message:"Cannot find the page data."})
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({message:"Error occurred while adding element."})
	}
}

