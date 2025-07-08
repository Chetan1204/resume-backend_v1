const {brandModel, categoryModel, modelModel} =  require("../models/brandModel");
const postModel = require("../models/postModel");
const {sendMail} = require("../config/mailerConfig");
const dataModel = require("../models/dataModel");
const pageModel = require("../models/pageModel");
const { userModel, orderModel } = require("../models/userModel");
const { couponModel } = require("../models/couponModel");
const {v4: uuidv4} = require("uuid")
const Quotation = require("../models/quotationModel")
const {reviewModel} = require("../models/reviewModel")
const requestCallBackModel = require("../models/callbackModel");
const postTypeModel = require("../models/postTypeModel");
const { InternalServerError, BadRequestError, UnauthorizedError, NotFoundError } = require("../config/apiErrors");
const { pricingManagerModel } = require("../models/priceManagerModel");


//Fetching Logics:
exports.getAllBatteries = async (req, res, next) => {
	try {
		console.log("getting all batteries...");
		const allBatteries = await postModel.find({customField:{ $elemMatch: { $eq : "Battery Model" } }});
		if(allBatteries && allBatteries.length > 0){
			const sanitized = allBatteries.map( item => ({postName:item?.postName, batteryName:item?.postData?.name, batteryImages:item?.postData?.batteryimages, warranty:item?.postData?.warranty, price:item?.postData?.specialprice, discount:item?.postData?.discount, isnew:item?.postData?.isnew}));
			res.status(200).json({success:true, data:sanitized});
		} else {
			throw new Error("NotFoundError")
		}
	} catch (error) {
		console.log(error);
		if (error.message === "NotFoundError") {
			next(new NotFoundError("Batteries not found", error))
		} else {
			next(new InternalServerError('Internal Server Error', error))
		}
	}
}

exports.getBattery = async (req, res) => {
	try {
		console.log("getting a battery...");
		console.log(req.params.batteryslug);
		const battery = await postModel.findOne({postName:req.params.batteryslug});
		if(battery){
			return res.status(200).json({success:true, data:battery});
		} else {
			return res.status(400).json({success:false, message:"Failed to get battery data. Please check the slug."});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error});
	}
}

exports.getBatteryByBrand = async (req, res) => {
	try {
		console.log("getting a battery...");
		console.log(req.params.brandname);
		const battery = await postModel.find({ 'postData.brand': req.params.brandname });
		console.log(battery.length)
		if(battery){
			return res.status(200).json({success:true, data:battery});
		} else {
			return res.status(400).json({success:false, message:"Failed to get battery data. Please check the slug."});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error});
	}
}

// RENDERS :

exports.renderAddBattery = async (req, res) => {
	try {
		console.log("rendering add battery page...");
		res.render("addbattery");
	} catch (error) {
		console.log(error);
		res.send("Some error occurred.")
	}
}

// LOGICS :

exports.getAllCarBrands = async (req, res) => {
	try {
		const brandsPostType = await postTypeModel.findOne({postTypeName:"Brands"});
		const categoryPostType = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const linkedCategoryMatch = await postModel.findOne({postType:categoryPostType._id, postName:"Car Batteries"})
		const allBrands = await postModel.find({postType:brandsPostType?._id, "postData.linkedCategories":{
			$elemMatch:{
				"value":`Car Batteries__${linkedCategoryMatch._id}`
			}
		}})
		res.status(200).send(allBrands)

	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}

exports.getPassengerVehicleBrands = async (req, res) => {
	try {
		console.log("Getting Passenger Vehicle Battery brands...");
		const brandsPostType = await postTypeModel.findOne({postTypeName:"Brands"});
		const categoryPostType = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const linkedCategoryMatch = await postModel.findOne({postType:categoryPostType._id, postName:"Car Batteries"})
		const allBrands = await postModel.find({postType:brandsPostType?._id, "postData.linkedCategories":{
			$elemMatch:{
				"value":`Car Batteries__${linkedCategoryMatch._id}`
			}
		}})
		res.status(200).json({success:true, products:allBrands})
	
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'server error'})
	}
}



exports.getInverterBrands = async (req, res) => {
	try {
		console.log('Getting inverter batteries...');
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const inverterCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter Batteries'});
		console.log("inverterCategory Post", `${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`);
		const inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`});
		console.log("INVERTERS FOUND ::", inverters);
		const inverterBrandNames = Array.from(new Set(inverters?.map(item => item?.postData?.brand)));
		const inverterBrands = [];
		for(let brandName of inverterBrandNames) {
			const brandMatch = await postModel.findOne({postName:brandName});
			brandMatch && inverterBrands.push({...brandMatch, postData:{...brandMatch.postData, brandLogo:brandMatch.postData.brandImage}});
		}
		res.status(200).json({success:true, products:inverterBrands});
	} catch (error) {
		console.log(error);
	}
}

exports.getHeavyEngineBatteryBrands = async (req, res) => {
	try {
		console.log("Getting Heavy Engine Battery brands...");
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const heavyEngineCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Heavy Engine Batteries'});
		const heavyEngineBatteries = await postModel.find({'postData.batterycategory.value':`${heavyEngineCategoryPost.postName}__${heavyEngineCategoryPost?._id}`});
		console.log("heavyEngineBatteries FOUND ::", heavyEngineBatteries);
		const heavyBatteryBrandNames = Array.from(new Set(heavyEngineBatteries?.map(item => item?.postData?.brand)));
		const heavyBatteryBrands = [];
		for(let brandName of heavyBatteryBrandNames) {
			const brandMatch = await postModel.findOne({postName:brandName});
			brandMatch && heavyBatteryBrands.push({...brandMatch, postData:{...brandMatch.postData, brandLogo:brandMatch.postData.brandImage}});
		}
		res.status(200).json({success:true, products:heavyBatteryBrands});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:true, message:'server error'});
	}
}

exports.getVRLASMFBatteryBrands = async (req, res) => {
	try {
		console.log("Getting VRLA / SMF Battery brands...");
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const VRLA_SMFCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'VRLA / SMF Batteries'});
		const vrlaSmfBatteries = await postModel.find({'postData.batterycategory.value':`${VRLA_SMFCategoryPost.postName}__${VRLA_SMFCategoryPost?._id}`});
		const vrlaSmfBatteryBrandNames = Array.from(new Set(vrlaSmfBatteries?.map(item => item?.postData?.brand)));
		const vrlaSmfBrands = [];
		for(let brandName of vrlaSmfBatteryBrandNames) {
			const brandMatch = await postModel.findOne({postName:brandName});
			brandMatch && vrlaSmfBrands.push({...brandMatch, postData:{...brandMatch.postData, brandLogo:brandMatch.postData.brandImage}});
		}
		res.status(200).json({success:true, products:vrlaSmfBrands});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:true, message:'server error'});
	}
}

exports.getInverterPlusBatteryComboBrands = async (req, res) => {
	try {
		console.log("Getting Inverter & Battery Combos...");
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const InverterBatteryComboCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter+Battery Combo'});
		const comboBatteries = await postModel.find({'postData.batterycategory.value':`${InverterBatteryComboCategoryPost.postName}__${InverterBatteryComboCategoryPost?._id}`});
		const comboBrandNames = Array.from(new Set(comboBatteries?.map(item => item?.postData?.brand)));
		const vrlaSmfBrands = [];
		for(let brandName of comboBrandNames) {
			const brandMatch = await postModel.findOne({postName:brandName});
			brandMatch && vrlaSmfBrands.push({...brandMatch, postData:{...brandMatch.postData, brandLogo:brandMatch.postData.brandImage}});
		}
		res.status(200).json({success:true, products:vrlaSmfBrands});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'server error'});
	}
}

exports.getVrlaSmfBatteries = async (req, res) => {
	try {
		console.log('Getting batteries of type : [VRLA / SMF Batteries]');
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const VRLA_SMFCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'VRLA / SMF Batteries'});
		const vrlaSmfBatteries = await postModel.find({'postData.batterycategory.value':`${VRLA_SMFCategoryPost.postName}__${VRLA_SMFCategoryPost?._id}`});
		res.status(200).json({success:true, products:vrlaSmfBatteries});
	} catch (error) {
		console.log(error);
		res.status(200).json({success:false, message:'server error'})
	}
}

exports.getInverterBatteryCombos = async (req, res) => {
	console.log("Getting batteries of type : [Inverter+Battery Combo]");
	const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
	const InverterBatteryComboCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter+Battery Combo'});
	const comboBatteries = await postModel.find({'postData.batterycategory.value':`${InverterBatteryComboCategoryPost.postName}__${InverterBatteryComboCategoryPost?._id}`});
	res.status(200).json({success:true, products:comboBatteries});
}

exports.getHeavyEngineBatteries = async (req, res) => {
	try {
		console.log('Getting batteries of type : [Heavy Engine Batteries]');
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const heavyEngineCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Heavy Engine Batteries'});
		const heavyEngineBatteries = await postModel.find({'postData.batterycategory.value':`${heavyEngineCategoryPost.postName}__${heavyEngineCategoryPost?._id}`});
		res.status(200).json({success:true, products:heavyEngineBatteries});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:true, message:'server error'});
	}
}



exports.getInverterPlusHomeUPSBrands = async (req, res) => {
	try {
		console.log("Getting Inverter Plus Home UPS Battery brands...");
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const inverterCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter & Home UPS Batteries'});
		console.log(inverterCategoryPost);
		const inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`});
		console.log(inverters)
		const inverterBrandNames = Array.from(new Set(inverters?.map(item => item?.postData?.brand)));
		const inverterBrands = [];
		for(let brandName of inverterBrandNames) {
			const brandMatch = await postModel.findOne({postName:brandName});
			brandMatch && inverterBrands.push({...brandMatch, postData:{...brandMatch.postData, brandLogo:brandMatch.postData.brandImage}});
		}
		res.status(200).json({success:true, products:inverterBrands})
	} catch (error) {
		console.log(error);
	}
}

exports.getInverterBatteries = async (req, res) => {
	try {
		console.log("Getting batteries of type : [Inverter Batteries]");
		const {brandname} = req.params;
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const inverterCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter Batteries'});
		console.log("inverterCategory Post", `${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`);
		const inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`, 'postData.brand':brandname});
		res.status(200).json({success:true, products:inverters})
	} catch (error) {
		console.log(error)
	}
}

exports.getInvertersAndHomeUps = async (req, res) => {
	try {
		console.log("Getting batteries of type : [Inverter & Home UPS Batteries]");
		const {brandname} = req.params;
		console.log(brandname);
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const inverterCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter & Home UPS Batteries'});
		console.log(inverterCategoryPost);
		const inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`, 'postData.brand':brandname});
		console.log(inverters);
		res.status(200).json({success:true, products:inverters})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'server error'});
	}	
}

exports.findInverters = async (req, res) => {
	try {
		console.log('Finding inverters...');
		const {category, brand, capacity} = req.body.state;
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const inverterCategoryPost = await postModel.findOne({postType:categoryPostTypeMatch?._id, 'postName':'Inverter Batteries'});
		let inverters = [];
		if(capacity && brand){
			if(brand === 'All Brands'){
				inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`, 'postData.capacity':capacity});
			} else {
				inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`, 'postData.capacity':capacity, 'postData.brand':brand});
			}
		} else {
			inverters = await postModel.find({'postData.batterycategory.value':`${inverterCategoryPost.postName}__${inverterCategoryPost?._id}`, 'postData.brand':brand});
		}
		res.status(200).json({success:true, products:inverters});

	} catch (error) {
		console.log(error);
	}
}


exports.getAllBatteryBrands = async (req, res) => {
	try {
		console.log("Getting all battery brands...");
		const allBrands = await postModel.find({postType:"65bb943f3047f00d56d5d638"});
		if(allBrands){
			res.status(200).json({success:true, message:"all brands fetched", data: allBrands.map(item => ({postName:item?.postName, brandName:item?.postData?.brandName, brandLogo:item?.postData?.brandImage}))})
		} else {
			res.status(400).json({success:false, message:"failed to get brands"})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}

exports.getAllBatteryCategories = async (req, res) => {
	try {
		console.log('Getting all battery categories...');
		const categoryPostType = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const categories = await postModel.find({postType:categoryPostType._id});
		res.status(200).json({success:true, categories});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:'server error'})
	}
}

exports.deleteBattery = async (req, res) => {
	try {
		console.log("deleting a battery...");
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}

exports.getPageContentByName = async (req, res) => {
	try {
		const {pagename} = req.query;
		const pageData = await pageModel.findOne({name:decodeURIComponent(pagename)});
		res.status(200).json({success:true, pageData})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}

exports.updateBatteriesByBrand = async (req, res) => {
	try {
		console.log("updating batteries by brand...");
		const {brand, data} = req.body;
		const batteries = await postModel.find({$and:[{modelName:"Battery Model"}, {'postData.brand':brand}]});
		if(batteries){
			batteries.forEach(async (item) => {
				item.postData = {...item.postData, ...data};
				await item.save();
			});
			res.status(200).json({success:true, message:"bulk updation of batteries by brand completed."});
		} else {
			res.status(400).json({success:true, message:"unable to get battery data"});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."});
	}
}

exports.updateBatteriesByCategory = async (req, res) => {
	try {
		console.log("updating batteries by category...");
		const {batteryCategory, data} = req.body;
		const batteries = await postModel.find({$and:[{modelName:"Battery Model"}, {'postData.batterycategory':batteryCategory}]});
		if(batteries){
			batteries.forEach(async (item) => {
				item.postData = {...item.postData, ...data};
				await item.save();
			});
			res.status(200).json({success:true, message:"bulk updation of batteries by brand completed."})
		} else {
			res.status(400).json({success:true, message:"unable to get battery data"});
		}
	} catch (error) {
		console.log(error)	
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}


exports.updateBatteriesByBrandAndCategory = async (req, res) => {
	try {
		console.log("updating batteries by brand and category...");
		const {batteryCategory, brand, data} = req.body;
		const batteries = await postModel.find({$and:[{modelName:"Battery Model"}, {'postData.batterycategory':batteryCategory}, {'postData.brand':brand}]});
		if(batteries){
			batteries.forEach(async (item) => {
				item.postData = {...item.postData, ...data};
				await item.save();
			});
			res.status(200).json({success:true, message:"bulk updation of batteries by brand completed."})
		} else {
			res.status(400).json({success:true, message:"unable to get battery data"});
		}
	} catch (error) {
		console.log(error)	
		res.status(500).json({success:false, error:error, message:"Server error."})
	}
}

exports.askBatteryQuotation = async (req, res) => {
	try {
		console.log("Asking for battery quotation...");
		const { productId, quantity, name, mobileNum, email, companyName, city, query } = req.body;

		const newQuotation = new Quotation({
			product: {
				id: productId,
				quantity: quantity
			},
			name: name,
			mobileNum: mobileNum,
			email: email,
			companyName: companyName,
			city: city,
			query: query
		});

		// Save the quotation to the database
		await newQuotation.save();

		res.status(200).json({ message: "Quotation saved successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
}

exports.addBatteryToCart = async (req, res) => {
	try {
		console.log('adding battery to cart...');
		const {batteryId, quantity, exchangeOldBattery} = req.body;

		const battery = await postModel.findOne({_id:batteryId});
		if(!battery) throw {status:400, message:"product not found"}

		const batteryPrice = exchangeOldBattery ? battery.postData?.pricewitholdbattery : battery.postData?.pricewithoutoldbattery;

		const user = await userModel.findOne({email:req.jwt.decoded?.email});
		if(!user) throw {status:400, message:"user not found. please login again."}
		
		const existingProduct = user.cart.find(item => item?.productId?.toString() === batteryId);
		console.log("existingProduct",existingProduct,batteryPrice);

		if(existingProduct){
			const user = await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "cart.productId":batteryId},{
				$inc: {
					"cart.$.productQuantity":quantity
				},
				
			});
			if(user?.currentOrder){
				await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "currentOrder.orderItems.productId":batteryId},{
					$inc:{
						"currentOrder.orderItems.$.productQuantity":quantity
					}
				})
			}
		} else {
			await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
				$addToSet:{
					cart:{
						$each:[{
							productName:battery.postName,
							productPrice:batteryPrice,
							productQuantity:quantity || 1,
							productId:battery?._id,
						}]
					}
				},
			});
			await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
				$set:{
					currentOrder:null
				}
			})
		}
		res.status(200).json({success:true, message:"product saved to cart", cart: user.cart})
	} catch (error) {
		console.log(error);	
		if(error?.status === 400){
			return res.status(error.status).message({success:false, message:error.message});
		} 
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.deleteCartItem = async (req, res) => {
	try {
		console.log('trying to delete cart item...');
		const {cartItem} = req.body;
		if(!cartItem) return res.status(400).json({success:false, message:"invalid item"})
		const user = await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "cart.productId":cartItem?.productId},{
			$pull:{
				cart:{productId:cartItem?.productId}
			}
		}, {new:true});
		res.status(200).json({success:true, message:"item removed"});
	} catch (error) {
		console.log(error)
	}
}

exports.showUserCart = async (req, res) => {
	try {
		console.log("displaying user cart contents...");
		const user = await userModel.findOne({email:req.jwt.decoded?.email});
		const detailedCart = [];
		let chosenDeliveryAddress = null;
		let coupon = null;
		if(user.currentOrder){
			for(let cartItem of user.currentOrder.orderItems){
				const product = await postModel.findOne({_id:cartItem?.productId});
				detailedCart.push({
					productId:cartItem?.productId,
					productName:cartItem.productName,
					productPrice:cartItem.productPrice,
					productQuantity:cartItem.productQuantity,
					productImage:product.postData?.batteryimages
				})
			}
			coupon = user.currentOrder?.coupon ?  user.currentOrder?.coupon : null;
			chosenDeliveryAddress = user.currentOrder.billingAddress;
		} else {
			for(let cartItem of user.cart){
				const product = await postModel.findOne({_id:cartItem?.productId});
				detailedCart.push({
					productId:cartItem?.productId,
					productName:cartItem.productName,
					productPrice:cartItem.productPrice,
					productQuantity:cartItem.productQuantity,
					productImage:product.postData?.batteryimages
				})
			}
		}
		res.status(200).json({success:true, cart:detailedCart, deliveryAddresses:user?.deliveryAddresses, chosenDeliveryAddress, coupon});
	} catch (error) {
		console.log(error);	
		res.status(500).json({success:false, message:"server error"});
	}
}

exports.applyCoupon = async (req, res) => {
	try {
		console.log("Getting coupon...");
		const {couponCode} = req.body;
		const coupon = await couponModel.findOne({couponCode:couponCode.toUpperCase()});
		if(!coupon) throw {status:400, message:"invalid coupon code."};
		res.status(200).json({success:true, coupon});
	} catch (error) {
		console.log(error);
		if(error?.status === 400){
			return res.status(error.status).json({success:true, message:error.message})
		}
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.addCartCoupon = async (req, res) => {
	try {
		console.log("Adding coupon to cart...");
		const { couponId,couponCode, couponDiscount, couponDescription} = req.body;
		const newCoupon = new couponModel({
			couponId, couponCode, couponDiscount, couponDescription
		});
		await newCoupon.save();
		res.status(200).redirect("/api/v1/manage/render-add-coupon-page")
	} catch (error) {
		console.log(error);	
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.updateDeliveryInformation = async (req, res) => {
	try {
		console.log("updating delivery information...");
		const {addressName, addressType, addressLineOne, addressLineTwo, state, city, pinCode, country} = req.body;
		const user = await userModel.findOne({email:req.jwt.decoded?.email});
		if(!user) throw {status:400, message:"user not found, please login again"}
		let arr = user.deliveryAddresses;
		if(addressType === "Home" && arr.filter(item => item?.addressType === "Home").length > 0){
			arr = arr.map(item =>{
				if (item.addressType === "Home"){
					return {
						...item, addressName, addressType, addressLineOne, addressLineTwo, state, city, pinCode, country
					}
				} else return item
			})
		} else if(addressType === "Office" && arr.filter(item => item?.addressType === "Office").length > 0){
			arr = arr.map(item =>{
				if (item.addressType === "Office"){
					return {
						...item, addressName, addressType, addressLineOne, addressLineTwo, state, city, pinCode, country
					}
				} else return item
			})
		}  else {
			arr.push({addressName, addressType, addressLineOne, addressLineTwo, state, city, pinCode, country})
		}
		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email}, {
			deliveryAddresses:arr
		});
		res.status(200).json({success:true})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"server error"});
	}
}

exports.initiateOrder = async (req, res) => {
	try {
		console.log("initiating a new order...");
		const {chosenAddress, cart, coupon} = req.body;
		const subtotal = cart?.map(item => (item?.productPrice * item.productQuantity)).reduce((acc, currVal) => acc + currVal, 0);
		const orderTotal = coupon ? subtotal - subtotal*(parseFloat(coupon?.couponDiscount)/100) : subtotal;
		const totalQuantity = cart.map(item => item.productQuantity).reduce((acc, currVal)=> acc+currVal, 0);
		const match = await userModel.findOne({email:req.jwt.decoded?.email});
		const user = await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			currentOrder:{
				orderId:uuidv4(),
				status:"Pending",
				buyerInformation:{
					firstName:match.firstName,
					lastName:match.lastName,
					email:match.email,
					phone:match.phone
				},
				subTotal:subtotal,
				orderTotal:orderTotal,
				discount:coupon?.couponDiscount,
				coupon,
				quantity:totalQuantity,
				orderItems:cart,
				shippingAddress:chosenAddress,
				billingAddress:chosenAddress,
				paymentMethod:undefined,
				preferedDateAndTime:undefined,
				gstBill:undefined
			}
		},{ new: true });
		res.status(200).json({success:true, message:"order initiated"})
	} catch (error) {
		console.log(error);	
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.updateExpressDeliveryStatus = async (req, res) => {
	try {
		console.log(`updating express delivery status. Express Delivery Status : [${req.body.express}]`);
		const {express} = req.body;
		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			"currentOrder.expressDelivery":express
		});
		res.status(200).json({success:true, message:"Express delivery enabled for this order"});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.getCurrentOrder = async (req, res) => {
	try {
		console.log("Getting current order details...");
		const user = await userModel.findOne({email:req.jwt.decoded?.email});
		if(!user) return res.status(400).json({success:false, message:"user not found, please login again"});
		return res.status(200).json({success:true, order:user.currentOrder});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"server error"});
	}
}

exports.filterInverterBattery = async (req, res) => {
	try {
		console.log("filtering inverter batteries...");
		const {category, capacity, brand} = req.body;
		const categoryPostTypeMatch = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const categoryMatch = await postModel.findOne({postName:category, postType:categoryPostTypeMatch?._id});
		let products;
		if(brand && brand === 'All Brands'){
			products = await postModel.find({'postData.capacity':capacity});
		} else if(brand) {
			products = await postModel.find({'postData.capacity':capacity, 'postData.brand':brand});
		}
		return res.status(200).json({success:true, products});
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error });
	}
}


exports.placeOrder = async (req, res) => {
	try {
		console.log(`placing order : ORDER ID [${req.body?.orderId}]`);
		const {orderId, confirmationDetails} = req.body;
		const match = await userModel.findOne({email:req.jwt.decoded?.email});
		if(!match.currentOrder.orderId === orderId) return res.status(400).json({success:false, message:"cannot find order"});
		let currentOrder = {...match.currentOrder.toObject({ virtuals: false, versionKey: false }), ...confirmationDetails};

		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			currentOrder,
		});
		
		const orderIndex = match.placedOrders.findIndex((element) => element.orderId === orderId);
		if(orderIndex !== -1){
			await userModel.findOneAndUpdate({email:req.jwt.decoded.email, "placedOrders.orderId":orderId},{
				$set:{
					"placedOrders.$":currentOrder
				}
			}, {upsert: true})
		} else {
			await userModel.findOneAndUpdate({email:req.jwt.decoded.email},{
				$push:{
					placedOrders:currentOrder
				}
			})
		}

		const {_id, ...unindexedOrder} = currentOrder;

		const orderMatch = await orderModel.findOne({orderId});
		if(!orderMatch){
			newOrder = new orderModel({...unindexedOrder});
			await newOrder.save();
		}
		
		if(currentOrder.paymentMethod === "Cash on Delivery"){
			await orderModel.findOneAndUpdate({orderId:orderId},{
				$set:{
					"status":"Cash__Pending"
				}
			});
			await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "placedOrders.orderId":orderId}, {
				$set:{
					"placedOrders.$.status":"Cash__Pending",
					"currentOrder":null,
					"cart":[]
				}
			})
		}

		res.status(200).json({success:true, message:"order placed", order: currentOrder});

	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"server error"})
	}
}

exports.getCompletedOrder = async (req, res) => {
	try {
		console.log("getting order information...");
		const {orderId} = req.body;
		const order = await orderModel.findOne({orderId});
		if(!order) return res.status(400).json({success: false, message:"cannot find order"});
		res.status(200).json({success:true, message:"order retireved", order});
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'server error'})
	}
}


exports.purchaseBattery = async (req, res) => {
	try {
		console.log("trying to pusrchase battery...");
	} catch (error) {
		console.log(error);
	}
}

exports.makeInquiry = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.makeChatInquiry = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.requestCallback = async (req, res) => {
	try {
		console.log("creating a new callback request...");
		const { name, contactNum,city,enquiry} = req.body;

		const newCallbackRequest = new requestCallBackModel({
			name:name,
			contactNum: contactNum,
			city: city,
			enquiry: enquiry
		});
		await newCallbackRequest.save();
		res.status(200).json({ message: "Call back request saved successfully" });

	} catch (error) {
		console.log(error)	
		res.status(500).json({message:"error adding callback request"})
	}
}

exports.fetchByCarBrand = async (req, res) => {
	try {
		console.log(`Fetching car batteries for brand : [${req.body?.brandName}]`)
		const {brandName} = req.body;
		console.log(brandName);
		const postType = await postTypeModel.findOne({postTypeName:"Car models"});
		const brandPostType = await postTypeModel.findOne({postTypeName:"Car Brands"});
		const brandData = await postModel.findOne({postType:brandPostType?._id, postName:brandName}).select("postData");
		const posts = await postModel.find({postType:postType?._id, "postData.CarBrand":brandName});
		console.log(posts);
		res.status(200).json({success:true, posts, brandData:{brandName:brandData?.postData?.brandName, brandLogo:brandData?.postData?.brandLogo}});
	} catch (error) {
		console.log(error);
		res.status(500).json({message:"error adding callback request"})
	}
}

exports.fetchTwoWheelerVehicleBrands = async (req, res) => {
	try {
		console.log("Fetching vehicle brands for two wheeler vehicles...");
		const brandsPostType = await postTypeModel.findOne({postTypeName:"Brands"});
		const categoryPostType = await postTypeModel.findOne({postTypeName:"Battery Categories"});
		const linkedCategoryMatch = await postModel.findOne({postType:categoryPostType._id, postName:"Two Wheeler Batteries"});

		const products = await postModel.find({postType:brandsPostType._id, "postData.linkedCategories":{
			$elemMatch:{
				"value":`Two Wheeler Batteries__${linkedCategoryMatch._id}`
			}
		}});

		let sanitizedProducts = [];
		for (let productItem of products){
			let filteredEquipments = [];
			if(productItem?.postData?.linkedEquipments?.length > 0){
				for(let equipmentItem of productItem?.postData?.linkedEquipments){
					const match = await postModel.findOne({_id:equipmentItem?.value?.split("__")[1]});
					if(match?.postData?.category?.find(item => item?.value === `Two Wheeler Batteries__${linkedCategoryMatch._id}`)){
						filteredEquipments.push(equipmentItem);
					}
				}
				productItem.postData.linkedEquipments = filteredEquipments;
			} 
			sanitizedProducts.push(productItem);
		}

		res.status(200).json({success:true, products:sanitizedProducts});

	} catch (error) {
		console.log(error);
		res.status(500).json({message:"error adding callback request"})
	}
}

exports.findBattery = async (req, res, next) => {
	try {
		const {carMake, carModel, batteryBrand, state, city} = req.body;
		const posts = await postModel.find({
			"category.categoryName":carModel
		});
		res.status(200).json({success:true, products:posts})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:"failed to find battery"})
	}
}

exports.findBatteriesByEquipment = async (req, res, next) => {
	try {
		console.log("Finding battery by equipment",req.body)
		const {id, type, value, brand, locationData} = req.body;
		const equipmentId = value?.split("__")[1];
		const equipment = await postModel.findOne({_id:equipmentId});
		const products = [];
		for (let batteryItem of equipment?.postData?.compatibleBatteries){
			let match = null;
			if(brand === "All Brands" || !brand){
				match = await postModel.findOne({_id:batteryItem?.value?.split('__')[1]})
			} else if(brand) {
				match = await postModel.findOne({_id:batteryItem?.value?.split('__')[1], 'postData.brand':brand})
			}
			if(match) {
				if(locationData && Object.keys(locationData)?.length > 0){
					const pricing = await pricingManagerModel.findOne({productId:match?._id});
					if(!pricing || !pricing.pricingAndAvailability?.filter(item => item.location === locationData?.city)?.length > 0) {
						products.push(match);
					} else if(pricing.pricingAndAvailability?.filter(item => item.location === locationData?.city)?.length > 0) {
						match.postData.mrp = pricing.pricingAndAvailability?.filter(item => item.location === locationData?.city)[0]?.mrp;
						products.push(match);
					}

				} else {
					products.push(match);
				}
			}
		}
		res.status(200).json({success:true, products})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:'server error'});
	}
}

exports.addToWishlist = async (req, res) => {
	try {
		const {batteryId} = req.body;
		
		const battery = await postModel.findOne({_id:batteryId});
		const batteryData = {
			productName:battery?.postName,
			productPrice:battery?.postData?.specialprice,
			productQuantity:1,
			productImage:battery?.postData?.batteryimages,
			productId:battery?._id
		}

		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			$addToSet:{
				wishList:{
					$each:[batteryData]
				}
			},
		});

		res.status(200).json({success:true, message:"product added to wishlist"});

	} catch (error) {
		console.log(error)	
	}
}

exports.removeFromWishlist = async (req, res) => {
	try {
		const {batteryId} = req.body;
		const user = await userModel.findOneAndUpdate({email:req.jwt.decoded?.email});
		const updatedWishlist = user.wishList.filter(item => item?.productId?.toString() !== batteryId);

		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			wishList:updatedWishlist
		});

		res.status(200).json({success:true, message:"product added to wishlist"});
	} catch (error) {
		console.log(error)
	}
}

exports.getWishlistData = async (req, res) => {
	try {
		console.log(req.jwt);	
		const user = await userModel.findOne({email:req.jwt.decoded?.email});
		if(!user) return res.status(400).json({success:false, message:"user not found login again"});
		res.status(200).json({success:true, wishList:user?.wishList});
	} catch (error) {
		console.log(error);
	}
}

exports.sendPurchaseConfirmationEmail = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.cancelCurrentOrder = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.updateServiceCharge = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.addProductReview = async (req, res) => {
	try {
		console.log("Asking for reviews...");
		const { productId, reviewerName,reviewScore,reviewContent} = req.body;

		const newReview = new reviewModel({
			productId:productId,
			reviewScore: reviewScore,
			reviewerName: reviewerName,
			reviewContent: reviewContent
		});
		
		await newReview.save();
		res.status(200).json({ message: "Review saved successfully" });

	} catch (error) {
		console.log(error)	
		res.status(500).json({message:"error adding review"})
	}
}

exports.updateDeliveryStatus = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.updateDeliveryStatus = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

