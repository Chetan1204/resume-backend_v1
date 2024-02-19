const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");
const { verifyUserLogin, verifyAdmin, verifyLogin } = require("../../middlewares/verifyLogin");


// fetching data routes

router.get("/get-all-batteries", manageController.getAllBatteries);
router.get("/get-battery/:batteryslug", manageController.getBattery);
router.get("/get-batteries-by-brand/:brandname",manageController.getBatteryByBrand);
router.post("/add-to-cart", verifyUserLogin, manageController.addBatteryToCart);
router.post("/remove-cart-item", verifyUserLogin, manageController.deleteCartItem);
router.get("/show-cart", verifyUserLogin, manageController.showUserCart);
router.post("/update-delivery-information", verifyUserLogin, manageController.updateDeliveryInformation);
router.post("/delivery-express", verifyUserLogin, manageController.updateExpressDeliveryStatus)
router.post("/apply-coupon", manageController.applyCoupon);
router.post("/add-to-wishlist", verifyUserLogin, manageController.addToWishlist);
router.post("/remove-from-wishlist", verifyUserLogin, manageController.removeFromWishlist);
router.get("/get-wishlist", verifyUserLogin, manageController.getWishlistData);

router.post("/initiate-order", verifyUserLogin, manageController.initiateOrder);
router.get("/get-current-order", verifyUserLogin, manageController.getCurrentOrder);
router.post("/place-order", verifyUserLogin, manageController.placeOrder);
router.post("/get-completed-order", verifyUserLogin, manageController.getCompletedOrder);


router.get("/get-batteries-by-subbrand");
router.get("/get-batteries-by-category");
router.get("/get-brands-by-category"); // if the battery is of car type then send the car brands else send the brand of battery itself.
router.get("/get-batteries-by-capacity");
router.get("/get-batteries-by-price");
router.get("/get-batteries-by-car");
router.get("/get-recommendations-for-battery");
router.get("/get-all-car-brands", manageController.getAllCarBrands);
router.get("/get-all-battery-brands", manageController.getAllBatteryBrands);
router.get("/get-all-battery-categories", manageController.getAllBatteryCategories);
router.get("/get-page-content", manageController.getPageContentByName);

// router.post("/add-coupon", verifyAdmin, verifyLogin, manageController.addCartCoupon)


// HRASHIKESH CODE CHANGES MERGE :: START
router.post("/add-coupon", verifyAdmin, verifyLogin, manageController.addCartCoupon);
router.post("/ask-battery-quotation", manageController.askBatteryQuotation);
router.post("/add-review", manageController.addProductReview);
router.post("/request-callback", manageController.requestCallback);
router.post("/get-cars", manageController.fetchByCarBrand)
router.get("/battery-type/two-wheeler-batteries", manageController.fetchTwoWheelerVehicleBrands);
router.get("/battery-type/car-batteries", manageController.getPassengerVehicleBrands);
router.get("/battery-type/inverter-batteries", manageController.getInverterBrands);
router.get("/battery-type/inverter-plus-home-ups-batteries", manageController.getInverterPlusHomeUPSBrands);
router.get("/battery-type/heavy-engine-batteries", manageController.getHeavyEngineBatteryBrands);
router.get("/battery-type/vrla-smf-batteries", manageController.getVRLASMFBatteryBrands);


router.get("/get-inverter-batteries/:brandname", manageController.getInverterBatteries);
router.get("/get-inverter-and-home-ups/:brandname", manageController.getInvertersAndHomeUps);
router.get("/get-heavy-engine-batteries/:brandname", manageController.getHeavyEngineBatteries);
router.get("/get-vrla-smf-batteries/:brandname", manageController.getVrlaSmfBatteries);




router.post("/find-inverters", manageController.findInverters)
router.post("/find-battery", manageController.findBattery);
router.post("/find-batteries-by-equipment", manageController.findBatteriesByEquipment);
router.post("/filter-inverter-batteies",manageController.filterInverterBattery);


// HRASHIKESH CODE CHANGES MERGE :: END


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