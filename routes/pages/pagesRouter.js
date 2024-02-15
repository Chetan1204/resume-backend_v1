const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");
const { verifyLogin } = require("../../middlewares/verifyLogin");

// GENERIC

router.get("/add-project",verifyLogin, pageController.renderAddProject);
router.post("/add-project",verifyLogin, uploader.single("websiteLogo"), pageController.addProject);
router.post("/submit-review",verifyLogin, pageController.submitReview);


// POST TYPE ROUTES
router.get("/get-post-types-and-links", verifyLogin, pageController.getPostTypesAndLinks);
router.post("/add-new-post-type", verifyLogin, pageController.addNewPostType);
router.get("/render-add-post-type", verifyLogin, pageController.renderAddPostType);
router.get("/render-all-post-types", verifyLogin, pageController.renderAllPostTypes);
router.get("/show-posts-by-post-type/:posttypeid", verifyLogin, pageController.showPosts);
router.get("/get-posts-by-post-type/:posttypeid", verifyLogin, pageController.getPosts);
router.post("/search-posts-by-name/:posttypeid", verifyLogin, pageController.searchPosts);
router.post("/filter-posts/:posttypeid", verifyLogin, pageController.filterPosts);
router.post("/remove-post-type", verifyLogin, pageController.deletePostType);
router.post("/link-post-type-to-model", verifyLogin, pageController.linkPostType);
router.post("/unlink-post-type", verifyLogin, pageController.unlinkPostType);
router.post("/pin-post-type", verifyLogin, pageController.pinPostType);


// POST ROUTES
router.get("/render-post", verifyLogin, pageController.showPost);
router.post("/create-post", verifyLogin, pageController.createPost);
router.post("/add-post-data", verifyLogin, uploader.any(), pageController.addPostData);
router.post("/update-post-array-item", verifyLogin, pageController.updatePostArrayItem);
router.post("/add-post-array-item", verifyLogin, uploader.any(), pageController.addPostArrayItem);
router.post("/add-post-repeater-item", verifyLogin, uploader.any(), pageController.addPostRepeaterItem);
router.post("/add-post-repeater-array-item", verifyLogin, uploader.any(), pageController.addPostRepeaterArrayItem);
router.post("/delete-post-array-item", verifyLogin, pageController.deletePostArrayItem);
router.post("/order-post-array-item", verifyLogin, pageController.orderPostArrayItem);
router.get("/all-posts", verifyLogin, pageController.allPosts);
router.post("/remove-post", verifyLogin, pageController.deletePost);
router.post("/add-post-category", verifyLogin, pageController.addPostCategory);
router.post("/unlink-category", verifyLogin, pageController.unlinkCategory);
router.post("/create-post-category", verifyLogin, pageController.createPostCategory);
router.post("/update-post-permalink", verifyLogin, pageController.updatePostPermaLink);
router.post("/change-post-visibility", verifyLogin, pageController.changePostVisibility);
router.post("/change-post-status", verifyLogin, pageController.changePostStatus);
router.post("/view-post-repeater-item", verifyLogin, pageController.viewPostRepeaterItem);
router.get("/render-post-repeater-item", verifyLogin, pageController.renderPostRepeaterItem);
router.post("/post-bulk-actions", verifyLogin, pageController.postBulkAction);
router.post("/update-post-repeater-item", verifyLogin, uploader.any(), pageController.updatePostRepeaterItem);


// PAGE RELATED ROUTES
router.post("/add-section", verifyLogin, pageController.addSection);
router.post("/add-element", verifyLogin, pageController.addElement);
router.get("/all-pages",verifyLogin, pageController.allPages); 
router.get("/show-published-pages",verifyLogin, pageController.showPublishedPages); 
router.get("/show-hidden-pages",verifyLogin, pageController.showHiddenPages); 
router.get("/add-new-page",verifyLogin, pageController.addNewPage);
router.post("/save-page-data",uploader.array("files"), verifyLogin, pageController.savePageData);
router.post("/save-page-data/add-button", verifyLogin, pageController.addButton);
router.post("/save-page-data/add-link", verifyLogin, pageController.addLink);
router.post("/remove-page", verifyLogin, pageController.removePage);
router.post("/remove-page-section", verifyLogin, pageController.removePageSection);
router.post("/remove-section-element", verifyLogin, pageController.removeSectionElement);
router.post("/save-field",verifyLogin, pageController.saveFields);
router.post("/page-attr-name-check",verifyLogin, pageController.checkNameAttr);
router.post("/add-page-section-array-item", verifyLogin, uploader.any(), pageController.addPageArrayItem);
router.post("/order-page-section-array-item", verifyLogin, pageController.orderPageArrayItem);
router.post("/update-page-item-textcontent", verifyLogin, pageController.updatePageItemTextContent);
router.post("/delete-page-array-item", verifyLogin, pageController.deletePageArrayItem);
router.post("/search-pages-by-name", verifyLogin, pageController.searchPagesByName);
router.post("/filter-pages", verifyLogin, pageController.filterPages);
router.post("/page-bulk-actions", verifyLogin, pageController.pageBulkAction);
router.post("/update-page-status", verifyLogin, pageController.updatePageStatus);


// MODEL RELATED ROUTES
router.get("/all-model-names-and-links", verifyLogin, pageController.getAllModelNamesAndLinks);
router.get("/add-new-model", verifyLogin, pageController.renderaddNewModel);
router.post("/add-new-model", verifyLogin, pageController.addNewModel);
router.post("/delete-model", verifyLogin, pageController.deleteModel);
router.post("/delete-model-field", verifyLogin, pageController.deleteModelField);
router.get("/rendermodel", verifyLogin, pageController.renderModel);
router.get("/all-models", verifyLogin, pageController.allModels);
router.post("/add-model-data", verifyLogin, pageController.addModelData);
router.post("/link-model-repeater", verifyLogin, pageController.linkModelRepeater);
router.post("/add-repeater-to-model", verifyLogin, pageController.addRepeaterToModel);
router.post("/delete-repeater", verifyLogin, pageController.deleteRepeater);
router.post("/pin-custom-field", verifyLogin, pageController.pinCustomField);
router.post("/search-models-by-name", verifyLogin, pageController.searchModelsByName);
router.post("/add-model-description", verifyLogin, pageController.addModelDescription);


// SETTING RELATED ROUTES
router.get("/change-theme",verifyLogin, pageController.renderchangeTheme);
router.post("/change-color-theme",verifyLogin,pageController.changeColorTheme);
router.get("/fetch-theme-name",verifyLogin, pageController.fetchTheme);
router.get("/get-user-data", verifyLogin, pageController.getUserData);

// HRASHIKESH CODE CHANGES MERGE :: START

// CUSTOM PAGES ROUTE
router.get("/render-quotations", verifyLogin, pageController.renderQuotationPage);
router.get("/render-reviews", verifyLogin, pageController.renderReviewPage);
router.get('/product/:productId/reviews',verifyLogin, pageController.renderReviewInnerPage );
router.get("/render-callback-requests", verifyLogin, pageController.renderCallbackRequests);

//COUPON RELATED ROUTES
router.get("/render-add-coupon-page", verifyLogin, pageController.renderAddCouponPage);
router.get("/all-coupons", verifyLogin, pageController.renderAllCoupons);
router.get("/delete-coupon/:couponId", verifyLogin, pageController.deleteCoupon);
router.get("/edit-coupon/:couponId", verifyLogin, pageController.editCoupon);


// HRASHIKESH CODE CHANGES MERGE :: END

module.exports = router;