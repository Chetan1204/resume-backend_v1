const pageModel = require('../models/pageModel');
const postModel = require('../models/postModel');
const dataModel = require('../models/dataModel');
const postTypeModel = require("../models/postTypeModel");
const { categoryModel } = require('../models/categoryModel');
const { v4: uuidv4 } = require('uuid');
const {getLastTwelveMonths} = require("../utils/utilFunctions");
const adminModel = require('../models/adminModel');
const ITEMS_PER_PAGE = 6;


exports.dashboard = async (req, res) => {
	res.render('dashboard');
}

exports.renderAddProject = async (req, res) => {
	const {decoded} = req.jwt;
	const userData = await adminModel.findOne({email:decoded?.email}).select("email username websiteName websiteUrl roles");
	res.render("addproject", {
		userData
	})
}

exports.addProject = async (req, res) => {
	try {
		const {decoded} = req.jwt;
		console.log(req.file);
		console.log(req.body);
		const user = await adminModel.findOneAndUpdate({email:decoded?.email},{
			$set:{
				'websiteUrl':req.body?.websiteUrl || "",
				'websiteName':req.body?.websiteName || "",
				'websiteLogo':req.file?.filename || "",
			}
		},{new:true});
		req.flash("toast", {message:"Website details updated", type:"success"});
		res.redirect("/api/v1/manage/all-pages");
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
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
		console.log("rendering all post-types");
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
		console.log("linking post-types...");
		const { linkPostTypeName, linkPostTypeId, linkModelId } = req.body;
		const postType = await postTypeModel.findOne({ _id: linkPostTypeId, postTypeName: linkPostTypeName });
		if (postType) {
			const model = await dataModel.findOne({ _id: linkModelId });
			postType.customField.push(model?.modelName);
			postType.customFieldId.push(model?._id);
			await postType.save();
			console.log("post-type linked to model");
			res.redirect(`/api/v1/manage/rendermodel?modelname=${encodeURIComponent(model?._id)}`);
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
		console.log("unlinking post-types");
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
			console.log("post-type unlinked from custom field");
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
		console.log("pinning post-types...");
		const { postTypeName, postTypeId, pin } = req.body;
		const postType = await postTypeModel.findOne({ _id: postTypeId, postTypeName });
		if (postType) {
			postType.pin = pin;
			await postType.save();
			console.log("post-type pinned");
			res.status(200).json({ success: true, message: "post-type pinned." })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error })
	}
}

exports.pinCustomField = async (req, res) => {
	try {
		console.log("pinning custom fields...")
;		const { modelName, modelId, pin } = req.body;
		const model = await dataModel.findOne({ _id: modelId, modelName });
		if (model) {
			model.pin = pin;
			await model.save();
			console.log("custom field pinned");
			res.status(200).json({ success: true, message: "post-type pinned." })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.createPost = async (req, res) => {
	try {
		console.log("creating post...");		
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
		console.log("post created");
		res.status(200).json({ success: true, message: "post created" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: true, message: "Server error", error: error });
	}
}

exports.allPages = async (req, res) => { 
	try {
		let numberOfPages;
		let finalPages;
		let thisPage;
		const {currentpage, paginationtype, searchquery, filterdate, filtercategory} = req.query;
		if(currentpage) thisPage = parseInt(currentpage) - 1;
		else thisPage = 0;
		const allPages = await pageModel.find({});
		numberOfPages = Math.ceil(allPages?.length / ITEMS_PER_PAGE);       
		finalPages = allPages.slice(0, ITEMS_PER_PAGE);

		if(paginationtype && paginationtype === 'default'){
			finalPages = allPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE);
		} 
		else if (paginationtype && paginationtype === 'search'){
			const search = new RegExp(searchquery, 'i');
			const filteredPages = await pageModel.find({name: search});
			numberOfPages = Math.ceil(filteredPages?.length / ITEMS_PER_PAGE);
			finalPages = filteredPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE)
		} 
		else if (paginationtype && paginationtype === 'filtered'){
			if (filterdate == "All Dates") {
			    if (filtercategory == "All Categories") {
			        let totalPages =await pageModel.find({});
					numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
					finalPages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
			    } else {
					let totalPages =await pageModel.find({ author:filtercategory });
					numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
					finalPages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
			    }
			} 
			else {
			    const startDate = new Date(`${filterdate}-01T00:00:00Z`);
			    const endDate = new Date(`${filterdate}-31T23:59:59Z`);
				
			    if (filtercategory == "All Categories") {
					let totalPages =await pageModel.find({
			            createdAt: { $gte: startDate, $lte: endDate }
			        });
					numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
					finalPages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
			    } else {
					let totalPages =await pageModel.find({
						author: filtercategory,
			            createdAt: { $gte: startDate, $lte: endDate }
			        });
					numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
					finalPages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
			    }
			}
		}
		const published = allPages.filter(page => page.status === 'published');
		const hidden = allPages.filter(page => page.visibility === 'hidden');
		const authors = [...new Set(allPages.map(page => page.author))];
		const dates = getLastTwelveMonths();
		console.log("rendering all pages...");
		res.render("all", { 
			allPages:finalPages || allPages, 
			message: req.flash("toast"),
			published,
			hidden,
			authors,
			dates,
			paginationtype: paginationtype || 'default',
			searchquery: searchquery || "",
			currentpage: currentpage || 1,
			numberOfPages,
			filterdate: filterdate || '',
			filtercategory: filtercategory || ''
		})
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}

exports.showPublishedPages = async (req, res) => {
	try {
		console.log("showing all published pages");
		const {currentpage, paginationtype, searchquery, filterdate, filtercategory} = req.query;
		const allPages = await pageModel.find({});
		const published = allPages.filter(page => page.status === 'published');
		const hidden = allPages.filter(page => page.visibility === 'hidden');
		const authors = [...new Set(allPages.map(page => page.author))];
		const dates = getLastTwelveMonths();
		let numberOfPages = Math.ceil(published?.length / ITEMS_PER_PAGE);  
		res.render("all", { 
			allPages:published, 
			message: req.flash("toast"),
			published,
			hidden,
			authors,
			dates,
			paginationtype: paginationtype || 'default',
			searchquery: searchquery || "",
			currentpage: currentpage || 1,
			numberOfPages,
			filterdate: filterdate || '',
			filtercategory: filtercategory || ''
		})
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}
exports.showHiddenPages = async (req, res) => {
	try {
		console.log("rendering all pages");
		const {currentpage, paginationtype, searchquery, filterdate, filtercategory} = req.query;
		const allPages = await pageModel.find({});
		const published = allPages.filter(page => page.status === 'published');
		const hidden = allPages.filter(page => page.visibility === 'hidden');
		const authors = [...new Set(allPages.map(page => page.author))];
		const dates = getLastTwelveMonths();
		let numberOfPages = Math.ceil(hidden?.length / ITEMS_PER_PAGE);  
		res.render("all", { 
			allPages:hidden, 
			message: req.flash("toast"),
			published,
			hidden,
			authors,
			dates,
			paginationtype: paginationtype || 'default',
			searchquery: searchquery || "",
			currentpage: currentpage || 1,
			numberOfPages,
			filterdate: filterdate || '',
			filtercategory: filtercategory || ''
		})
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}

exports.addNewPage = async (req, res) => {
	try {
		console.log("adding a new page");
		res.redirect("/api/v1/manage/all-pages?addnewmodal=true");
	} catch (error) {
		console.error('Error fetching pages:', error);
		res.status(500).send('Internal Server Error');
	}
}

exports.saveFields = async (req, res) => {
	try {
		console.log('saving fields data...');
		const { pageName, data } = req.body;
		const page = await pageModel.findOne({ name: pageName });
		if (!page) {
			return res.status(404).json({ message: 'Page not found' });
		}
		page.data = data;
		await page.save();
		console.log("saved fields");
		res.status(200).json({ message: 'Fields saved successfully' });
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

exports.checkNameAttr = async (req, res) => {
	try {
		console.log("running name check. checking uniqueness of the name attribute...");
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
			console.log("name check : Success")
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
		console.log("rendering all posts...");
		const {currentpage, paginationtype, searchquery, filterdate, filtercategory} = req.query;
		let numberOfPages;
		let thisPage;
		if(currentpage) thisPage = parseInt(currentpage) -1;
		else thisPage = 0;
		let filteringByModel = undefined;
		if (req.query?.filterbymodel) {
			filteringByModel = req.query?.filterbymodel;
		}
		const allPostsData = filteringByModel ? await postModel.find({ modelName: filteringByModel }) : await postModel.find({});
		numberOfPages = Math.ceil(allPostsData?.length / ITEMS_PER_PAGE);
		let finalPosts = allPostsData.slice(0, ITEMS_PER_PAGE);

		if(paginationtype && paginationtype === 'default'){
			finalPosts = allPostsData.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE);
			numberOfPages = Math.ceil(allPostsData?.length / ITEMS_PER_PAGE);
		} else if(paginationtype && paginationtype === 'search'){

		} else if(paginationtype && paginationtype === 'filtered'){

		}

		const allModels = await dataModel.find({});
		const allCategories = await categoryModel.find();
		// const allTags = // some logic here
		const sanitizedModelData = allModels.map(item => ({
			modelName: item.modelName
		}))
		console.log("rendering all posts.");
		res.render("allposts", {
			allPosts: finalPosts || allPostsData, 
			allModels: sanitizedModelData, 
			allCategories,
			numberOfPages,
			paginationtype: paginationtype || 'default',
			searchquery: searchquery || '',
			filterdate: filterdate || '',
			filtercategory: filtercategory || ''
		});
	} catch (error) {
		console.log("error rendering posts",error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.renderAddPostType = async (req, res) => {
	try {
		console.log("rendering add new post-type page...");
		const allModels = await dataModel.find({});
		res.render("addNewPostType", { allModels })
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deletePost = async (req, res) => {
	try {
		console.log('deleting post...');
		const { postName, postId } = req.body;
		const match = await postModel.findOneAndDelete({ _id: postId });
		if (match) {
			const postType = await postTypeModel.findOne({ _id: match?.postType });
			allPosts = await postModel.find({ postType: postType?._id }).countDocuments();
			postType.postCount = allPosts;
			await postType.save();
			console.log("post deleted successfully");
			res.status(200).json({ success: true, message: "post deleted" })
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addNewPostType = async (req, res) => {
	try {
		console.log("adding a new post-type");
		const { postTypeName, postTypeSlug } = req.body;
		const newPostType = new postTypeModel({
			postTypeName: postTypeName,
			postTypeSlug: postTypeSlug,
		});
		await newPostType.save();
		console.log("new post-type added");
		res.redirect("/api/v1/manage/render-all-post-types");
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.showPosts = async (req, res) => {
	try {
		const {currentpage, paginationtype, searchquery, filterdate, filtercategory, published, hidden} = req.query;
		let numberOfPages;
		let thisPage;
		if(currentpage) thisPage = parseInt(currentpage) -1;
		else thisPage = 0;
		const dates = getLastTwelveMonths();
		const posts = await postModel.find({ postType: req.params.posttypeid });
		const postType = await postTypeModel.findOne({ _id: req.params.posttypeid });
		const allModels = await dataModel.find({});
		const allCategories = await categoryModel.find();

		numberOfPages = Math.ceil(posts?.length / ITEMS_PER_PAGE);
		let finalPosts = posts.slice(0, ITEMS_PER_PAGE);

		if(paginationtype && paginationtype === 'default'){
			finalPosts = posts.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE);
			numberOfPages = Math.ceil(posts?.length / ITEMS_PER_PAGE);
		} else if(paginationtype && paginationtype === 'search'){
			const searchRegexp = new RegExp(searchquery, 'i');
			const allPosts = await postModel.find({postType: req.params.posttypeid, postName:searchRegexp});
			finalPosts = allPosts.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE);
			numberOfPages = Math.ceil(allPosts?.length / ITEMS_PER_PAGE);
		} else if(paginationtype && paginationtype === 'filtered'){
			let posts;
			if (filterdate == "All Dates") {
				if (filtercategory == "All Categories") {
					posts = await postModel.find({ postType: req.params.posttypeid });
					finalPosts = posts?.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE)
				} else {
					posts = await postModel.find({
						postType: req.params.posttypeid,
						category: {
							$elemMatch: { _id: filtercategory }
						}
					});
					finalPosts = posts?.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE)
				}
			} else {
				const startDate = new Date(`${filterdate}-01T00:00:00Z`);
				const endDate = new Date(`${filterdate}-31T23:59:59Z`);

				if (filtercategory == "All Categories") {
					posts = await postModel.find({
						postType: req.params.posttypeid,
						createdAt: { $gte: startDate, $lte: endDate }
					});
					finalPosts = posts?.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE)
				} else {
					posts = await postModel.find({
						postType: req.params.posttypeid,
						category: {
							$elemMatch: { _id: filtercategory }
						},
						createdAt: { $gte: startDate, $lte: endDate }
					});
					finalPosts = posts?.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE+ITEMS_PER_PAGE)
				}
			}
			numberOfPages = Math.ceil(posts?.length / ITEMS_PER_PAGE);
		}

		console.log("pagination updated, rendering all posts...");
		res.render("allposts", {
			allPosts: published === 'true' ? finalPosts.filter(item => item?.status === 'published') : hidden === 'true' ? finalPosts.filter(item => item.visibility === 'hidden') : finalPosts,
			published: finalPosts.filter(item => item?.status === 'published'),
			drafts: finalPosts.filter(item => item?.status === 'draft'),
			hidden: finalPosts.filter(item => item?.visibility === 'hidden'),
			allModels,
			postTypeName: postType.postTypeName,
			postTypeId: req.params.posttypeid,
			dates,
			allCategories,
			currentpage: currentpage || 1,
			paginationtype: paginationtype || 'default',
			searchquery: searchquery || '',
			filterdate: filterdate,
			filtercategory: filtercategory,
			numberOfPages
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.searchPosts = async (req, res) => {
	try {
		const {searchName} = req.body;
		const dates = getLastTwelveMonths();
		const searchRegexp = new RegExp(searchName, 'i');
		const posts = await postModel.find({postType: req.params.posttypeid, postName:searchRegexp});
		let numberOfPages = Math.ceil(posts?.length / ITEMS_PER_PAGE);
		const allPosts = await postModel.find({ postType: req.params.posttypeid });
		const postType = await postTypeModel.findOne({ _id: req.params.posttypeid });
		const allModels = await dataModel.find({});
		const allCategories = await categoryModel.find();
		console.log("posts search results obtained. rendering ...");
		res.render("allposts", {
			allPosts: posts?.slice(0, ITEMS_PER_PAGE),
			published: allPosts.filter(item => item?.status === 'published'),
			drafts: allPosts.filter(item => item?.status === 'draft'),
			hidden: allPosts.filter(item => item?.visibility === 'hidden'),
			allModels,
			postTypeName: postType.postTypeName,
			postTypeId: req.params.posttypeid,
			dates,
			allCategories,
			currentpage:1,
			paginationtype:'search',
			searchquery:searchName,
			filterdate:'',
			filtercategory:'',
			numberOfPages
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.filterPosts = async (req, res) => {
    try {
        let posts;
        const { filterCategory, filterDate } = req.body;

        if (filterDate == "All Dates") {
            if (filterCategory == "All Categories") {
                posts = await postModel.find({ postType: req.params.posttypeid });
            } else {
                posts = await postModel.find({
                    postType: req.params.posttypeid,
                    category: {
                        $elemMatch: { _id: filterCategory }
                    }
                });
            }
        } else {
            const startDate = new Date(`${filterDate}-01T00:00:00Z`);
            const endDate = new Date(`${filterDate}-31T23:59:59Z`);

            if (filterCategory == "All Categories") {
                posts = await postModel.find({
                    postType: req.params.posttypeid,
                    createdAt: { $gte: startDate, $lte: endDate }
                });
            } else {
                posts = await postModel.find({
                    postType: req.params.posttypeid,
                    category: {
                        $elemMatch: { _id: filterCategory }
                    },
                    createdAt: { $gte: startDate, $lte: endDate }
                });
            }
        }

		let numberOfPages = Math.ceil(posts?.length / ITEMS_PER_PAGE);
        const allPosts = await postModel.find({ postType: req.params.posttypeid });
        const postType = await postTypeModel.findOne({ _id: req.params.posttypeid });
        const allModels = await dataModel.find({});
        const allCategories = await categoryModel.find();
        const dates = getLastTwelveMonths();

        res.render("allposts", {
            allPosts: posts.slice(0, ITEMS_PER_PAGE),
            published: allPosts.filter(item => item?.status === 'published'),
            drafts: allPosts.filter(item => item?.status === 'draft'),
            hidden: allPosts.filter(item => item?.visibility === 'hidden'),
            allModels,
            postTypeName: postType.postTypeName,
            postTypeId: req.params.posttypeid,
            dates,
            allCategories,
			currentpage:1,
			paginationtype:'filtered',
			searchquery:'',
			filterdate:filterDate,
			filtercategory:filterCategory,
			numberOfPages
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.filterPages = async (req, res) => {
    try {
        let numberOfPages;
		let thisPage;
		const {currentpage, paginationtype, searchquery} = req.query;
		if(currentpage) thisPage = parseInt(currentpage) - 1;
		else thisPage = 0;
		let totalPages;
        let pages;
        const { filterCategory, filterDate } = req.body;

        if (filterDate == "All Dates") {
            if (filterCategory == "All Categories") {
                totalPages =await pageModel.find({});
				numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
				pages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
            } else {
				totalPages =await pageModel.find({ author:filterCategory });
				numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
				pages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
            }
        } else {
            const startDate = new Date(`${filterDate}-01T00:00:00Z`);
            const endDate = new Date(`${filterDate}-31T23:59:59Z`);
            
            if (filterCategory == "All Categories") {
				totalPages =await pageModel.find({
                    createdAt: { $gte: startDate, $lte: endDate }
                });
				numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
				pages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
            } else {
				totalPages =await pageModel.find({
					author: filterCategory,
                    createdAt: { $gte: startDate, $lte: endDate }
                });
				numberOfPages = Math.ceil(totalPages?.length / ITEMS_PER_PAGE);
				pages = totalPages.slice(thisPage*ITEMS_PER_PAGE, thisPage*ITEMS_PER_PAGE + ITEMS_PER_PAGE);
            }
        }

        const allPages = await pageModel.find({});
        const published = allPages.filter(page => page.status === 'published');
        const hidden = allPages.filter(page => page.visibility === 'hidden');
        const authors = [...new Set(allPages.map(page => page.author))];
        const dates = getLastTwelveMonths();

        res.render("all", {
            allPages: pages,
            message: req.flash("toast"),
            published,
            hidden,
            authors,
            dates,
            paginationtype: 'filtered',
			searchquery: searchquery || "",
			currentpage: currentpage || 1,
			numberOfPages,
			filtercategory:filterCategory,
			filterdate:filterDate
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.pageBulkAction = async (req, res) => {
    try {
        const { action } = req.body;
        if (action === "publish all") {
            await pageModel.updateMany({}, { status: 'published', visibility: 'visible' });
        } else if (action === "hide all") {
            await pageModel.updateMany({}, { status: 'hidden', visibility: 'hidden' });
        } else {
            return res.status(400).json({ message: "Invalid action selected" });
        }
        const updatedPages = await pageModel.find({});
        res.status(200).json({ message: "Pages updated successfully", updatedPages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while updating page status." });
    }
};


exports.postBulkAction = async (req, res) => {
    try {
        const { action, postTypeId } = req.body;
		console.log(req.body)

        const filter = { postType: postTypeId };

        if (action === "publish all") {
            await postModel.updateMany(filter, { status: 'published', visibility: 'visible' });
        } else if (action === "hide all") {
            await postModel.updateMany(filter, { status: 'hidden', visibility: 'hidden' });
        } else {
            return res.status(400).json({ message: "Invalid action selected" });
        }

        const updatedPosts = await postModel.find(filter);
        res.status(200).json({ message: "post updated successfully", updatedPosts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while updating page status." });
    }
}

exports.deletePostType = async (req, res) => {
	try {
		console.log("deleting a post-type...");
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
		console.log("adding post data...");
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
}

exports.addPageArrayItem = async (req, res) => {
	try {
		console.log("adding page array item...");
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
		console.log('deleting page array item');
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

exports.searchPagesByName = async (req, res) => {
	try {

		// paginationtype: paginationtype || 'default',
		// searchquery: searchquery || "",
		// currentpage: currentpage || 1,
		// numberOfPages,

		const search = new RegExp(req.body?.searchName, 'i');
		const filteredPages = await pageModel.find({name: search});
		const numberOfPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
		const allPages = await pageModel.find({});
		const published = allPages.filter(page => page.status === 'published');
		const hidden = allPages.filter(page => page.visibility === 'hidden');
		const authors = [...new Set(allPages.map(page => page.author))];
		const dates = getLastTwelveMonths();
		res.render("all", { 
			allPages:filteredPages.slice(0,ITEMS_PER_PAGE), 
			message: req.flash("toast"),
			published,
			hidden,
			authors,
			dates,
			search,
			paginationtype:'search',
			searchquery: req.body?.searchName,
			numberOfPages,
			currentpage: 1,
			filterdate: '',
			filtercategory: ''
		})
	} catch (error) { 
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.searchModelsByName = async (req, res) => {
	try {
		const search = new RegExp(req.body?.searchName, 'i');
		console.log("rendering all models page...");
		const allModels = await dataModel.find({modelName: search});
		res.render("allmodels", { allModels });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.updatePageItemTextContent = async (req, res) => {
	try {
		console.log("updaing page item text-content");
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
		console.log("adding post array item...");
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
		console.log("adding post repeater item");
		const {postName, postTypeId, modelName, repeaterId, ...repeaterData} = req.body;
		let allFiles = {};
		req.files.forEach(fileItem =>{
			allFiles[fileItem.fieldname] = fileItem.filename;
		})
		const model = await dataModel.findOne({modelName});
		const chosenRepeater = model.dataObject?.repeaters.filter(item => item?.id === repeaterId)[0];
		let sortedData = {}
		chosenRepeater.fields.forEach(field => {
			sortedData[field.fieldName] = repeaterData[field.fieldName] || allFiles[field.fieldName]
		})
		const postMatch = await postModel.findOne({postName,postType:postTypeId});
		if(postMatch?.postData?.repeaters && postMatch.postData?.repeaters.filter(item => item?.repeaterId === repeaterId)?.length > 0){
			
			const post = await postModel.findOneAndUpdate({postName, postType:postTypeId},{
				$push:{
					'postData.repeaters.$[repeaterElement].data':sortedData
				}
			},{
				new:true,
				arrayFilters:[
					{'repeaterElement.repeaterId':repeaterId}
				]
			});

		} else {
			
			const post = await postModel.findOneAndUpdate({postName, postType:postTypeId},{
				$push:{
					'postData.repeaters':{
						repeaterName:chosenRepeater?.repeaterName,
						repeaterId:chosenRepeater?.id,
						data:[sortedData]
					}
				}
			},{
				new:true
			});

		}
		return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.updatePostRepeaterItem = async (req, res) => {
	try {
		const {postName, postTypeId, repeaterId, repeaterItemIndex, modelId, ...repeaterItemData} = req.body;
		const post = await postModel.findOne({postName, postType:postTypeId});
		req.files.forEach(fileItem => {
			repeaterItemData[fileItem?.fieldname] = fileItem.filename
		})
		const originalRepeaterData = post.postData.repeaters.filter(item => item?.repeaterId === repeaterId)[0]?.data[parseInt(repeaterItemIndex)];
		await postModel.findOneAndUpdate({postName, postType:postTypeId},{
			$set:{
				[`postData.repeaters.$[repeaterItem].data.${repeaterItemIndex}`]:{...originalRepeaterData, ...repeaterItemData}
			}
		},{
			arrayFilters:[{ 'repeaterItem.repeaterId':repeaterId }],
			new:true
		})
		return res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.addPostRepeaterArrayItem = async (req, res) => {
	try {
		console.log("Adding repeater array item, inside a post...");
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
			$addToSet:{
				[`postData.${repeaterName}.${arrayName}`]:{
					id:uuidv4(),
					type:itemType,
					value:treatedItemValue
				}
			}
		},{new:true})
		res.status(200).json({success:true, data:post});
	} catch (error) {
		console.log("Some error occurred.");
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.deletePostArrayItem = async (req, res) => {
	try {
		console.log("deleting post array item");
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
		console.log("updating post array item...");
		const { postName, postTypeId, arrayName, arrayIndex, itemId, itemType, itemValue } = req.body;
		const post = await postModel.findOneAndUpdate({ postName, postType: postTypeId, [`postData.${arrayName}.id`]: itemId }, {
			$set: { [`postData.${arrayName}.$.value`]: itemValue }
		});
		await post.save();
		res.status(200).json({ success: true });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.orderPageArrayItem = async (req, res) => {
	try {	
		console.log("ordering page array item...");
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
		console.log("ordering post array items...");
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
		console.log("creating post category...");
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

exports.updatePostPermaLink = async (req, res) => {
	try {
		console.log("updating post permalink...");
		const {postName, postTypeId, permalink} = req.body;
		const post = await postModel.findOneAndUpdate({postName, postType:postTypeId}, {
			$set:{
				'permaLink':permalink
			}
		}, {new:true});
		res.redirect(`/api/v1/manage/render-post?postname=${encodeURIComponent(postName)}&postid=${encodeURIComponent(postTypeId)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.changePostVisibility = async (req, res) => {
	try {
		console.log("changing post visibility state...");
		const {postName, postTypeId, selectedValue} = req.body;
		const post = await postModel.findOneAndUpdate({postName, postType:postTypeId},{
			$set:{
				'visibility':selectedValue
			}
		},{new:true});
		await res.status(200).json({success:true})
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.changePostStatus = async (req, res) => {
	try {
		console.log("changing post status...");
		const {postName, postTypeId, selectedValue} = req.body;
		const post = await postModel.findOneAndUpdate({postName, postType:postTypeId},{
			$set:{
				'status':selectedValue
			}
		},{new:true});
		await res.status(200).json({success:true})
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error', error });
	}
}

exports.addPostCategory = async (req, res) => {
	try {
		console.log("adding post category...");
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
		console.log("unlinking category from post...");
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
		console.log("rendering post...");
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
				console.log("processign custom fields");
				for (const item of items) {
					const model = await dataModel.findOne({ modelName: item });
					if (model) {
						let modifiedDataObject = {}; 
						for( let item of Object.keys(model?.dataObject)) {
							if(typeof(model?.dataObject[item]) == 'string'){
								modifiedDataObject[item] = model?.dataObject[item]
							} else if(Array.isArray(model?.dataObject[item]) && item === 'repeaters') {
								modifiedDataObject = {...modifiedDataObject, repeaters:model?.dataObject[item]}
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
				permaLink:post.permaLink,
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
				permaLink:post.permaLink,
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

exports.viewPostRepeaterItem = async (req, res) => {
	try {
		const {modelName, postName, postTypeId, repeaterId, repeaterItemIndex} = req.body;
		res.redirect(`/api/v1/manage/render-post-repeater-item?modelName=${encodeURIComponent(modelName)}&postName=${encodeURIComponent(postName)}&postTypeId=${encodeURIComponent(postTypeId)}&repeaterId=${encodeURIComponent(repeaterId)}&repeaterItemIndex=${encodeURIComponent(repeaterItemIndex)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.renderPostRepeaterItem = async (req, res) => {
	try {
		console.log("#####RENDERING#######", req.query)
		const {modelName, postName, postTypeId, repeaterId, repeaterItemIndex} = req.query;
		const repeaterModel = await dataModel.findOne({modelName});
		const repeaterFields = repeaterModel.dataObject?.repeaters.filter(item => item?.id === repeaterId)[0]?.fields;
		const match = await postModel.findOne({postName, postType:postTypeId});
		const repeaterData = match.postData?.repeaters.filter(item => item?.repeaterId === repeaterId)[0]?.data[parseInt(repeaterItemIndex)];
		res.render("repeateritem",{
			postName,
			postTypeId,
			repeaterItemIndex,
			repeaterId,
			modelId:repeaterModel?._id,
			repeaterData,
			repeaterFields
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.renderaddNewModel = async (req, res) => {
	try {
		console.log("rendering add new model page");
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
		console.log("adding new model data...");
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
			res.redirect(`/api/v1/manage/rendermodel?modelname=${encodeURIComponent(newDataModel?._id)}`);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.deleteModel = async (req, res) => {
	console.log("deleting a model...");
	const { modelName } = req.body;
	const model = await dataModel.findOneAndDelete({ modelName })
	res.status(200).json({ success: true, message: "Model deleted." })
}

exports.deleteModelField = async (req, res) => {
	console.log("deleting a model field...");
	const {fieldName, modelId} = req.body;
	const model = await dataModel.findOneAndUpdate({_id:modelId},{
		$unset:{
			[`dataObject.${fieldName}`]: 1
		}
	}, { new: true });
	res.status(200).json({success:true});
}

exports.renderModel = async (req, res) => {
	try {
		console.log("rendering a model...");
		const encodedModelName = req.query.modelname;
		if (!encodedModelName) {
			return res.redirect("/add-new-model");
		} else {
			const decodedModelName = decodeURIComponent(encodedModelName);
			const dataMatch = await dataModel.findOne({ _id: decodedModelName });
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
		console.log("rendering all models page...");
		const allModels = await dataModel.find({});
		res.render("allmodels", { allModels });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.getAllModelNamesAndLinks = async (req, res) => {
	try {
		console.log("getting all model names and links...");
		const allModels = await dataModel.find({ pin: true });
		const sanitizedData = allModels.map(item => ({ modelName: item.modelName, _id: item?._id }));
		res.status(200).json({ success: true, data: sanitizedData });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.addModelData = async (req, res) => {
	try {
		console.log("adding model data...");
		const { modelName, modelData } = req.body;
		const existingData = await dataModel.findOne({ modelName });
		if (!existingData) {
			return res.status(400).json({ success: false, message: 'Model not found.' });
		}
		const filteredModelData = Object.fromEntries(
			Object.entries(modelData).filter(([key]) => key.trim() !== '')
		);
		existingData.dataObject = { ...filteredModelData, repeaters:existingData.dataObject?.repeaters ? [...existingData.dataObject.repeaters] : undefined };
		await existingData.save();
		res.status(200).json({ success: true, updatedData: existingData });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.addModelDescription = async (req, res) => {
	try {
		const {modelId, description} = req.body;
		const existingModel = await dataModel.findOneAndUpdate({_id:modelId}, {
			$set:{
				description
			}
		});
		await existingModel.save();
		res.redirect(`/api/v1/manage/rendermodel?modelname=${encodeURIComponent(existingModel?._id)}`);
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.linkModelRepeater = async (req, res) => {
	try {
		console.log("linking model with repeater...");
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

exports.addRepeaterToModel = async (req, res) => {
	try {
		console.log("adding repeater data to model...");
		const {modelId, repeaterLabel, repeaterName, fields, existingRepeater} = req.body;
		if(!existingRepeater){
			const match = await dataModel.findOneAndUpdate({_id:modelId}, {
				$push:{
					[`dataObject.repeaters`]:{
						id:uuidv4(),
						repeaterName,
						repeaterLabel,
						fields
					}
				}
			},{new:true})
			res.status(200).json({success:true, data:match})
		} else {
			const match = await dataModel.findOneAndUpdate(
				{ _id: modelId },
				{
				  $set: {
					'dataObject.repeaters.$[repeaterMatch].fields': fields
				  }
				},
				{
				  arrayFilters: [
					{ 'repeaterMatch.id': existingRepeater }
				  ],
				  new: true
				}
			);
			console.log(match);
			res.status(200).json({success:true, data: match})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.deleteRepeater = async (req, res) => {
	try {
		console.log("deleting repeater from model...");
		const {modelId, repeaterName, repeaterId} = req.body;
		const model = await dataModel.findOneAndUpdate({_id:modelId},{
			$pull:{
				'dataObject.repeaters':{
					id:repeaterId
				}
			}
		},{new:true});
		const post = await postModel.updateMany({}, {
			$pull:{
				'postData.repeaters':{
					repeaterId
				}
			}
		})
		res.status(200).json({success:true})

	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

exports.savePageData = async (req, res) => {
	try {
		console.log("saving page data...");
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
		console.log("removing page...");
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
		console.log("remove page section...");
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
		console.log("remove section element...");
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
		console.log("adding section to page...");
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
		console.log("section added to page");
		res.status(200).json({ success: true });
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addButton = async (req, res) => {
	try {
		console.log("adding button...");
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
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		console.error('Error saving fields:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}

exports.addLink = async (req, res) => {
	try {
		console.log("adding link...");
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
			console.log("link added successfully");
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
		console.log("adding element...");
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
				console.log("element added to section "+sectionName+" successfully");
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

exports.renderchangeTheme = async(req,res)=>{
	try {
		const user = await adminModel.findOne({email: req.jwt?.decoded?.email});
		
		res.render("colorThemeSetting", {
			themeName:user?.themeName,
			message:req.flash("toast"),
			username:user?.username,
			email:user?.email,
			profileImage: user?.profileImage
		})
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Error occurred while fetching page." });
	}
}

exports.changeColorTheme = async (req, res) => {
    try {
        const { themeName } = req.body;
		console.log("========>",req.jwt)
        const updatedUser = await adminModel.findOneAndUpdate(
            { email: req.jwt?.decoded?.email },
            { $set: { themeName: themeName } },
            { new: true }
        );

        if (updatedUser) {
            console.log("ThemeName updated successfully:", updatedUser);
            // Send a success response or do further actions if needed
            return res.status(200).redirect("/api/v1/manage/change-theme");
        } else {
            console.log("User not found with the given email.");
            return res.status(404).json({ message: "User not found with the given email." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error occurred while processing the request." });
    }
};
exports.fetchTheme = async (req, res) => {
    try {
        const { decoded } = req.jwt;
        const email = decoded.email;
        const user = await adminModel.findOne({ email: email });

        if (user) {
            // Retrieve the theme name
            const themeName = user.themeName;

            // Send the themeName in the response
            res.json({ themeName: themeName });
        } else {
            res.status(404).json({ message: "User not found with the given email." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error occurred while processing the request." });
    }
};

exports.getUserData = async (req, res) => {
	try {
		const { decoded } = req.jwt;
        const email = decoded.email;
		const userData = await adminModel.findOne({email}).select("email username roles websiteName websiteUrl websiteLogo profileImage");
		res.status(200).json({success:true, userData})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"internal server error", error})
	}
}