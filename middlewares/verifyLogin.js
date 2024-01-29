const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");

exports.verifyLogin = async (req, res, next) => {
	try {
		const {access_token} = req.session;
		if(!access_token) return res.redirect("/api/v1/manage/auth/")
		const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
		if(!decoded) return res.redirect("/api/v1/manage/auth")
		const match = await adminModel.findOne({email: decoded.email});
		if(match && access_token === match.access_token){
			req.jwt = {decoded}
			next();
		} else{
			res.redirect("/api/v1/manage/auth")
		}
	} catch (error) {
		console.log(error);
		res.status(400).json({success:false, error});
	}
}

exports.verifyAdmin = async (req, res, next) => {
	try {
		const {access_token} = req.session;
		if(!access_token) return res.redirect("/api/v1/manage/auth/")
		const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
		if(!decoded) return res.redirect("/api/v1/manage/auth/")
		const match = await adminModel.findOne({email: decoded.email});
		if(match && match.roles.indexOf("admin") !== -1){
			next();
		} else{
			res.redirect("/api/v1/manage/auth")
		}
	} catch (error) {
		console.log(error);
		res.status(400).json({success:false, error});
	}
}
