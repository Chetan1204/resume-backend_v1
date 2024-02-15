const { logger } = require("../utils/logger")

exports.apiErrorHandler = function(error, req, res, next) {
	// if(error.source){
	// 	logger(error.source)
	// }
	res.status(error.statusCode).json({status:"Error", statusCode:error.statusCode, message:error.message})
}