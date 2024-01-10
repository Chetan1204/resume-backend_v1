const {brandModel, categoryModel, modelModel} =  require("../models/brandModel");
const postModel = require("../models/postModel");
const {sendMail} = require("../config/mailerConfig");
const dataModel = require("../models/dataModel");

//Fetching Logics:
exports.getAllBatteries = async (req, res) => {
	try {
		console.log("getting all batteries...");
		const allBatteries = await postModel.find({customField:{ $elemMatch: { $eq : "Battery Model" } }});
		if(allBatteries){
			const sanitized = allBatteries.map( item => ({postName:item?.postName, batteryName:item?.postData?.name, batteryImages:item?.postData?.batteryimages}));
			res.status(200).json({success:true, data:sanitized});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error});
	}
}

exports.getBattery = async (req, res) => {
	try {
		console.log("getting a battery...");
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

exports.getAllBrands = async (req, res) => {
	try {
		console.log("getting all brands...");
		const allBrands = await postModel.find({modelName:"Brand Model"});
		if(allBrands){
			res.status(200).json({success:true, message:"all brands fetched", data: allBrands.map(item => ({postName:item?.postName, brandName:item?.postData?.brandname, brandLogo:item?.postData?.brandlogo}))})
		} else {
			res.status(400).json({success:false, message:"failed to get brands"})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error, message:"Server error."})
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
			res.status(200).json({success:true, message:"bulk updation of batteries by brand completed."})
		} else {
			res.status(400).json({success:true, message:"unable to get battery data"});
		}
	} catch (error) {
		console.log(error)	
		res.status(500).json({success:false, error:error, message:"Server error."})
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
		console.log("asking for battery quotation...");
	} catch (error) {
		console.log(error)	
	}
}

exports.addBatteryToCart = async (req, res) => {
	try {
		console.log("adding battery to cart...");
	} catch (error) {
		console.log(error)	
	}
}

exports.purchaseBattery = async (req, res) => {
	try {
		console.log("trying to pusrchase battery...");
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

