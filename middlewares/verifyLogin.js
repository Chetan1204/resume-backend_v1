const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/userModel");

exports.verifyLogin = async (req, res, next) => {
	try {
		const {access_token} = req.session;
		console.log(access_token);
		if(!access_token) return res.redirect("/api/v1/manage/auth/")
		const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
		console.log(decoded);
		if(!decoded) return res.redirect("/api/v1/manage/auth")
		const match = await adminModel.findOne({email: decoded.email});
		if(match && access_token === match.access_token){
			req.jwt = {decoded}
			next();
		} else{
			res.redirect("/api/v1/manage/auth")
		}
	} catch (error) {
		console.log("ERROR IN LOGIN VERIFICATION::",error.message)
		console.log(error);
		res.status(400).json({success:false, error});
	}
}

exports.verifyUserLogin = async (req, res, next) => {
	try {
		console.log("verifying user login");
		const {access_token} = req.session;
		if(!access_token) {
			console.log("access token not found")
			throw {status:400}
		}
		const decoded = jwt.verify(access_token, process.env.USER_ACCESS_TOKEN_SECRET);
		if(!decoded) {
			console.log("decoded data not found");
			throw {status:400}
		}
		const match = await userModel.findOne({email:decoded.email});
		if(match && access_token === match.access_token){
			req.jwt = {decoded}
			next();
		} else{
			console.log("Inside verify user else condition");
			console.log(access_token, match?.access_token);
			throw {status : 400}
		}
	} catch (error) {
		console.log(error);
		if(error.status === 400){
			res.status(error.status).json({success:false, message:"invalid token"});
		} else {
			res.status(500).json({success:false, error, message:'server error'});	
		}
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
