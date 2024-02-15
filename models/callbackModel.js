const mongoose = require("mongoose")

const requestCallBackSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    contactNum:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    enquiry:{
        type:String,
        required:true
    }
})

const requestCallBackModel = new mongoose.model("call_back_requests",requestCallBackSchema)
module.exports = requestCallBackModel;