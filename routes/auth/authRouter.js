const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");
const authController = require("../../controllers/authController");
const { verifyLogin } = require("../../middlewares/verifyLogin");

router.get("/", authController.renderLoginPage)
router.post("/admin-register", authController.handleAdminRegister);
router.post("/admin-login", authController.handleAdminLogin);
router.get("/admin-logout", authController.handleAdminLogout);
router.get("/forgot-password", authController.handleForgotPassword);
router.post("/verify-otp",authController.generateOtp);
router.post("/add-new-password",authController.verifyOtp);
router.post("/update-password",authController.updatePassword);
router.post("/update-user-profile",verifyLogin, uploader.single("profileImage"), authController.updateUserProfile);
router.get("/check-login-status", authController.checkLoginStatus);

// userRouter
router.post("/user-register",authController.handleUserRegister);
router.post("/user-email-verify", authController.verifyEmail);
router.post("/send-verification-email", authController.sendVerificationEmail);
router.post("/user-login",authController.handleUserLogin);
router.get("/login-check",authController.handleLoginCheck);
router.get("/user-logout",authController.handleUserLogout);


module.exports = router;