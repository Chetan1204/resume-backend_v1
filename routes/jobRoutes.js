const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {createJob, getJobs,getJobById } = require("../controllers/jobController");


//Multer Configuration
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        const dir = 'uploads/resumes';
       if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }
        cb(null, dir);
    },
    filename: function (req,file, cb){
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer ({storage});

// POSTCreate a new job
router.post('/jobs', upload.array('resumes',10), createJob);
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);

module.exports = router;