const Razorpay = require("razorpay");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Paytm = require('paytm-pg-node-sdk');

const razorpayInstance = new Razorpay({
	key_id: process.env.key_id,
	key_secret: process.env.key_secret,
});

// API signature
// {razorpayInstance}.{resourceName}.{methodName}(resourceId [, params])

// example
// instance.payments.fetch(paymentId);

module.exports = {razorpayInstance, stripe}