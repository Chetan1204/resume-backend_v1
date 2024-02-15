const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");
const paymentsAndOrdersController = require("../../controllers/paymentsAndOrdersController");
const { verifyUserLogin } = require("../../middlewares/verifyLogin");

// for razorpay
router.post("/create-razorpay-order", verifyUserLogin, paymentsAndOrdersController.createOrder);
router.post("/verify-payment", verifyUserLogin, paymentsAndOrdersController.verifyPayment);
router.post("/get-payment-details", paymentsAndOrdersController.getPaymentDetails)

// for stripe
router.post("/create-checkout-session", paymentsAndOrdersController.createStripeCheckout)


module.exports = router;