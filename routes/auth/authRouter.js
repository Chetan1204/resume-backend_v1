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
router.post("/verify-otp",authController.generateOtp)
router.post("/add-new-password",authController.verifyOtp)
router.post("/update-password",authController.updatePassword)
router.post("/update-user-profile",verifyLogin, uploader.single("profileImage"), authController.updateUserProfile);


module.exports = router;