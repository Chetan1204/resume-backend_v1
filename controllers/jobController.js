const Job = require('../models/jobModel');
const {v4: uuidv4} = require('uuid');

exports.createJob = async (req, res) => {
    try{
        const {
            jobTitle,
            description,
            skills,
            author,
            naukriUrl,
            status,
        } = req.body;

        const jobId = uuidv4(); // Generate a unique job ID

        const resumeFiles = req.files?.map((file)=> ({
            fileName: file.originalname,
            filePath: file.path,
        }));

        const newJob = new Job({
            jobId,
            jobTitle,
            description,
            skills: skills?.split(",").map(skill => skill.trim()),
            author,
            naukriUrl,
            status,
            resumes: resumeFiles,
        });

        await newJob.save();
        res.status(201).json({ success: true, job: newJob});
    }
    catch(error){
        console.error("Create job Error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

// GET single job by All jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedOn: -1 }); // latest first
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET single job by id
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id); 

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};