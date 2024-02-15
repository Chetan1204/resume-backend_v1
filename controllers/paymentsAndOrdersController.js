const { razorpayInstance, stripe } = require("../config/paymentGatewayConfig");
const dataModel = require("../models/dataModel");
const postModel = require("../models/postModel");
const {v4: uuidV4} = require("uuid");
const { orderModel, userModel } = require("../models/userModel");
const FRONTEND_URL = process.env.FRONTEND_URL;
const crypto = require("crypto")

/**
 * Create an Order	
 * Creates an order by providing basic details such as amount and currency.
 * amount, currency is required
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.createOrder = async (req, res) => {
	try {
		const { orderId, notes} = req.body;
		const currency = "INR";
		const receipt = uuidV4();
		const match = await orderModel.findOne({orderId});
		
		const razorpayOrder = await razorpayInstance.orders.create({
			amount: match.expressDelivery ?  (match.orderTotal+match.quantity*200)*100 : match.orderTotal*100,
			currency: currency || "INR",
			receipt:receipt,
		});
		
		const order = await orderModel.findOneAndUpdate({orderId},{
			razorpayOrderId:razorpayOrder.id,
			razorpayOrderReceipt:razorpayOrder.receipt,
		});
		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email},{
			"currentOrder.razorpayOrderId":razorpayOrder.id,
			"currentOrder.razorpayOrderReceipt":razorpayOrder.receipt,
		})
		await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "placedOrders.orderId":orderId},{
			"placedOrders.$.razorpayOrderId":razorpayOrder.id,
			"placedOrders.$.razorpayOrderReceipt":razorpayOrder.receipt,
		})
		res.status(200).json({ success: true, message: 'Order created', razorpayOrder: razorpayOrder, order, key_id:process.env.key_id })
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

exports.verifyPayment = async (req, res) => {
	try {
		
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const shasum = crypto.createHmac("sha256", process.env.key_secret);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

exports.createStripeCheckout =   async (req, res) => {
	
	const { batteryData } = req.body;
	console.log(batteryData)
	const battery = await postModel.findOne({postName:batteryData.name});
	if(!battery) return res.status(400).json({success:false, message:"cannot find the product"})

	const session = await stripe.checkout.sessions.create({
	  payment_method_types: ['card'],
	  line_items: [
		{
		  price_data: {
			currency:"INR",
			product_data: {
			  name: battery?.postData?.name,
			  images: ['https://cdn.shopify.com/s/files/1/0070/7032/files/universal_20product_20code.png?format=jpg&quality=90&v=1697911576&width=1024'],
			},
			unit_amount: parseInt(battery?.postData?.specialprice)*100,
		  },
		  quantity: 1,
		},
	  ],
	  mode: 'payment',
	  success_url: 'http://192.168.16.36:5173/?status=success',
	  cancel_url: 'http://192.168.16.36:5173/?status=failure',
	});
  
	res.json({ id: session.id, publishable_key:process.env.STRIPE_PUBLISHABLE_KEY });
  }

/**
 * Fetch all Orders	
 * Retrieves details of all the orders.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.fetchAllOrders = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Fetch all Orders (With Expanded Payments)
 * Retrieves details of all the orders and expands the payments object.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.fetchAllOrdersExpandedPayments = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Fetch all Orders (With Expanded Card Payments)
 * Retrieves details of all the orders and expands cards parameter in the payments object.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.fetchAllOrdersExpandedCardPayments = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Fetch an Order
 * Retrieves details of a particular order.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.fetchOrder = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Fetch all Payments for an Order	
 * Retrieves all the payments made for an order.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.fetchAllOrderPayments = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Update an Order	
 * Modifies an existing order.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}  
 */
exports.updateOrder = async (req, res) => {
	try {
		// 
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}


/**
 * Verify Payment
 * Verifies the payment status of an existing order.
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}
 */

exports.verifyPayment = async (req, res) => {
	try {
		const {response, orderId} = req.body; 
		const secret = process.env.key_secret;
		const stringToSign = `${response.razorpay_order_id}|${response.razorpay_payment_id}`;
		const hmac = crypto.createHmac('sha256', secret);
		const signature = hmac.update(stringToSign).digest('hex');

		if (signature === response.razorpay_signature) {
			
			await userModel.findOneAndUpdate({email:req.jwt.decoded?.email, "placedOrders.orderId":orderId},{
				$set:{
					"placedOrders.$.status":"Completed",
					"currentOrder":null,
					"placedOrders.$.razorpayPaymentId":response.razorpay_payment_id,
					cart:[],
				}
			})

			await orderModel.findOneAndUpdate({orderId},{
				$set:{
					"status":"Completed",
					razorpayPaymentId:response.razorpay_payment_id
				}
			})

			res.status(200).json({ success: true, message: 'Payment verified', orderId });

		} else {
			// Invalid payment signature
			res.status(400).json({ success: false, message: 'Invalid payment signature' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

/**
 * Get Payment Details
 * Get the detals regarding the payment for a particular order
 * @param {object} req 
 * @param {object} res
 * 
 * @returns {object}
 */

exports.getPaymentDetails = async (req, res) => {
	try {
		// get the receipt id from the request;
		const {receipt} = req.body;
		const localOrder = await orderModel.findOne({receipt});
		if(!localOrder) return res.status(400).json({success:false, message:"Bad receipt"});
		const order = await razorpayInstance.orders.fetch(localOrder.id);
		if(order){
			res.status(200).json({success:true, message:"Order details fetched", order})
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}