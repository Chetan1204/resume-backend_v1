const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");


// fetching data routes

router.get("/get-all-batteries", manageController.getAllBatteries);
router.get("/get-battery/:batteryslug", manageController.getBattery);
router.get("/get-batteries-by-brand");
router.get("/get-batteries-by-subbrand");
router.get("/get-batteries-by-category");
router.get("/get-brands-by-category"); // if the battery is of car type then send the car brands else send the brand of battery itself.
router.get("/get-batteries-by-capacity");
router.get("/get-batteries-by-price");
router.get("/get-batteries-by-car");
router.get("/get-recommendations-for-battery");
router.get("/get-all-brands", manageController.getAllBrands)


// router.post("/add-battery", uploader.array("batteryImages",5), manageController.addBattery);
// router.post("/add-brand", manageController.addBrand);
// router.post("/add-subbrand", manageController.addSubBrand);
// router.post("/add-category", manageController.addCategory);
// router.post("/update-battery", manageController.updateBattery);
// router.post("/delete-battery", manageController.deleteBattery);
// router.post("/update-battries-by-brand", manageController.updateBatteriesByBrand);
// router.post("/update-battries-by-category", manageController.updateBatteriesByCategory);
// router.post("/update-battries-by-brand-and-category", manageController.updateBatteriesByBrandAndCategory);
// router.post("/ask-battery-quotation", manageController.askBatteryQuotation);
// router.post("/add-battery-to-cart", manageController.addBatteryToCart);
// router.post("/purchase-battery", manageController.purchaseBattery);
// router.post("/make-inquiry", manageController.makeInquiry);
// router.post("/make-chat-inquiry", manageController.makeChatInquiry);
// router.post("/request-callback", manageController.requestCallback);
// router.post("/add-to-wishlist", manageController.addToWishlist);
// router.post("send-purchase-confirmation-email", manageController.sendPurchaseConfirmationEmail);
// router.post("/order-cancellation", manageController.cancelCurrentOrder);
// router.post("/update-service-charge", manageController.updateServiceCharge);
// router.post("/add-review", manageController.addProductReview);
// router.post("update-delivery-status", manageController.updateDeliveryStatus);


module.exports = router;