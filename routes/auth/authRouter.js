const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");
const authController = require("../../controllers/authController");

router.get("/", authController.renderLoginPage)
router.post("/admin-register", authController.handleAdminRegister);
router.post("/admin-login", authController.handleAdminLogin);
router.post("/admin-logout", authController.handleAdminLogout);

module.exports = router;