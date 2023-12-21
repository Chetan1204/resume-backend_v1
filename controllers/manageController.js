const {batteryModel} = require("../models/batteryModel");
const {brandModel, categoryModel, modelModel} =  require("../models/brandModel");


// RENDERS :
exports.renderAllBatteriesPage = async (req, res) => {
	try {
		const products = await batteryModel.find({});
		res.render("batteriespage", {
			products
		});
	} catch (error) {
		console.log(error);
		res.send("Some error occurred.")
	}
}

exports.renderAddBattery = async (req, res) => {
	try {
		res.render("addbattery");
	} catch (error) {
		console.log(error);
		res.send("Some error occurred.")
	}
}

// LOGICS :

exports.addBattery = async (req, res) => {
	try {
		
		// data comes in req.body;
		const batteryBrand = req.body.brand;
		const brandMatch = await brandModel.findOne({brandName:batteryBrand});
		if(!brandMatch){
			// create new Brand first
			const newBrand = new brandModel({
				brandName:batteryBrand, 
			});
			await newBrand.save();
		}
		console.log("req.files", req.files["batteryImages"]);
		// now create a new battery
		const newBattery = new batteryModel({
			brand:batteryBrand,
			subBrand: brandMatch ? req.body.subBrand : "",
			name:req.body?.name,
			warranty:req.body.warranty,
			batteryCategory:req.body?.batteryCategory,
			batteryType:req.body?.batteryType,
			capacity:req.body?.capacity,
			mrp:req.body?.mrp,
			specialPrice:req.body?.specialPrice,
			stock:req.body?.stock,
			priceWithOldBattery:req.body?.priceWithOldBattery,
			priceWithoutOldBattery:req.body?.priceWithoutOldBattery,
			offers:req.body?.offers,
			features:req.body?.features,
			description:req.body?.description,
			specifications:req.body?.specifications,
			recommendedFor:req.body?.recommendedFor,
			discount:req.body?.discount,
			batteryImages:req.files["batteryImages"]
		});
		await newBattery.save();
		res.status(200).json({success:true});

	} catch (error) {
		console.log(error);	
	}
}

exports.addBrand = async (req, res) => {
	try {
		const brandData = {
			brandName:req.body?.brandName, 
			brandLogo:req.body?.brandLogo,
			subBrands:req.body?.subBrands,
			vehicleModels:req.body?.vehicleModels,
			brandDescription:req.body?.brandDescription,
			brandFeatures:req.body?.brandFeatures
		}
		const newBrand = new brandModel(brandData);
		await newBrand.save();
	} catch (error) {
		console.log(error);
	}
}

exports.addSubBrand = async (req, res) => {
	try {
		const brandName = req.body?.brandName;
		const brandMatch = await brandModel.findOne({brandName: brandName});
		if(brandMatch){
			brandMatch.subBrands.push(req.body?.subBrands);
			await brandMatch.save();
			res.status(200).json()
		} else {
			return res.status(400).json({success:true, message:"Cannot find brand, please enter a valid brand name."})
		}
	} catch (error) {
		console.log(error)
	}
}

exports.addCategory = async (req, res) => {
	try {
		const newCategory = new categoryModel({
			categoryName:req.body.categoryName
		});
		await newCategory.save();
		res.status(200).json({success:true, message:"New category created."})
	} catch (error) {
		console.log(error);
	}
}

exports.updateBattery = async (req, res) => {
	try {
		const batteryMatch = await batteryModel.findOne({_id: req.body?.batteryId});
		if(!batteryMatch) return res.status(400).json({success:false, message:"Cannot find the article, please check the battery id."})
		if(req.body.brand) batteryMatch.brand = req.body.brand;
		if(req.body.subBrand) batteryMatch.subBrand = req.body.subBrand;
		if(req.body?.name) batteryMatch.name = req.body?.name;
		if(req.body.warranty) batteryMatch.warranty = req.body.warranty;
		if(req.body?.batteryCategory) batteryMatch.batteryCategory = req.body?.batteryCategory;
		if(req.body?.batteryType) batteryMatch.batteryType = req.body?.batteryType;
		if(req.body?.capacity) batteryMatch.capacity = req.body?.capacity;
		if(req.body?.mrp) batteryMatch.mrp = req.body?.mrp;
		if(req.body?.specialPrice) batteryMatch.specialPrice = req.body?.specialPrice;
		if(req.body?.stock) batteryMatch.stock = req.body?.stock;
		if(req.body?.priceWithOldBattery) batteryMatch.priceWithOldBattery = req.body?.priceWithOldBattery;
		if(req.body?.priceWithoutOldBattery) batteryMatch.priceWithoutOldBattery = req.body?.priceWithoutOldBattery;
		if(req.body?.offers) batteryMatch.offers = req.body?.offers;
		if(req.body?.features) batteryMatch.features = req.body?.features;
		if(req.body?.description) batteryMatch.description = req.body?.description;
		if(req.body?.specifications) batteryMatch.specifications = req.body?.specifications;
		if(req.body?.recommendedFor) batteryMatch.recommendedFor = req.body?.recommendedFor;
		if(req.body?.discount) batteryMatch.discount = req.body?.discount;
		if(req.files["batteryImages"]) batteryMatch.batteryImages = req.files["batteryImages"];

		await batteryMatch.save();
		res.status(200).json({success:true, message:"Battery item updated successfully."})
	} catch (error) {
		console.log(error)
	}
}

exports.deleteBattery = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)
	}
}

exports.updateBatteriesByBrand = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.updateBatteriesByCategory = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.updateBatteriesByBrandAndCategory = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.askBatteryQuotation = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.addBatteryToCart = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
	}
}

exports.purchaseBattery = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
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
		
	} catch (error) {
		console.log(error)	
	}
}

exports.addToWishlist = async (req, res) => {
	try {
		
	} catch (error) {
		console.log(error)	
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

