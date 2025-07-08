const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

const jobSchema = new mongoose.Schema({
    jobId:{
        type: String,
        required: true,
        unique: true,
    },

    jobTitle:{
        type: String,
        required: true,

    },

    description: String,
    skills: [String],
    postedOn: {
        type: Date,
        default: Date.now,
    },

    author: String,
    naukriUrl : String,
    status:{
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },

    resumes:[resumeSchema],
});

module.exports = mongoose.model('Job', jobSchema);