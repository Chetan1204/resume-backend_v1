const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
	key_id: process.env.key_id,
	key_secret: process.env.key_secret,
});

// API signature
// {razorpayInstance}.{resourceName}.{methodName}(resourceId [, params])

// example
// instance.payments.fetch(paymentId);

module.exports = {razorpayInstance}