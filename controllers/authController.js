const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.renderLoginPage = async (req, res) => {
	try {
		
		res.render("login");
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:error.message, error})
	}
}

exports.handleAdminRegister = async (req, res) => {
	try {
		
		const {email, username, password, confirmPassword} = req.body;
		const match = await adminModel.findOne({$or:[{email:email}, {username:username}]});
		if(match) return res.status(400).json({success:false, message:"email and/or username already exists"});
		if(password !== confirmPassword){
			return res.status(400).json({success:false, message:"passwords do not match"}); 
		}
		const hash = await bcrypt.hash(password, 10);
		const newAdmin = new adminModel({
			email,
			username,
			password:hash,
			roles:["admin"],
			status:false
		});
		await newAdmin.save();
		res.status(200).json({success:true, message:"user registered successfully"})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:error.message, error})
	}
}

exports.handleAdminLogin = async (req, res) => {
	try {
		
		const {email, password} = req.body;
		const match = await adminModel.findOne({email});
		if(!match) return res.status(403).json({success:false, message:"invalid credentials, please check your email and/or password."});
		if(await bcrypt.compare(password, match.password)){
			const access_token = jwt.sign({email, roles:match.roles}, process.env.ACCESS_TOKEN_SECRET);
			match.access_token = access_token;
			match.status = true;
			req.session.access_token = access_token;
			await match.save();
			res.redirect("/api/v1/manage/all-pages");
		} else {
			res.status(403).json({success:false, message:"invalid credentials, please check your email and/or password."});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:error.message, error})
	}
}

exports.handleAdminLogout = async (req, res) => {
	try {
		
		const {access_token} = req.session;
		if(!access_token) return res.status(400).json({success:false, message:"session expired, please login again"})
		const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
		if(decoded){
			const match = await adminModel.findOne({email:decoded.email});
			if(!match) return res.status(400).json({success:false, message:"session expired, please login again"});
			match.access_token = "";
			match.status = false;
			req.session.access_token = "";
			await match.save();
			res.status(200).json({success:false, message:"logged out"})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, message:error.message, error})
	}
}