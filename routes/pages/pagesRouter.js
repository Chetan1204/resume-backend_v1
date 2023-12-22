const express = require("express");
const router = express.Router();
const pageController = require('../../controllers/pageController'); 
const manageController = require("../../controllers/manageController");
const uploader = require("../../middlewares/fileUploader");

// Page Management Logics: 

router.get("/all-model-names-and-links", pageController.getAllModelNamesAndLinks)
router.get("/dash",pageController.dashboard );
router.post("/add-section", pageController.addSection);
router.post("/add-element", pageController.addElement);
router.get("/all-pages",pageController.allPages);
router.get("/add-new-page",pageController.addNewPage);
router.post("/save-page-data",uploader.array("files"), pageController.savePageData);
router.post("/save-page-data/add-button", pageController.addButton);
router.post("/save-page-data/add-button", pageController.addLink);
router.post("/remove-page", pageController.removePage);
router.post("/remove-page-section", pageController.removePageSection);
router.post("/remove-section-element", pageController.removeSectionElement);
router.post("/save-field",pageController.saveFields);
router.get("/add-new-model", pageController.renderaddNewModel);
router.post("/add-new-model", pageController.addNewModel);
router.get("/rendermodel", pageController.renderModel);
router.get("/all-models", pageController.allModels);
router.post("/add-model-data", pageController.addModelData);
router.get("/render-add-post", pageController.renderAddPost);
router.get("/render-post", pageController.showPost);
router.post("/add-new-post-data", pageController.addNewPost);
router.post("/add-post-data", pageController.addPostData);
router.get("/all-posts", pageController.allPosts);
router.post("/remove-post", pageController.deletePost);

module.exports = router;