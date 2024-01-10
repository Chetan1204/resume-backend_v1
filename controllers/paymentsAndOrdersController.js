const { razorpayInstance, stripe } = require("../config/paymentGatewayConfig");
const dataModel = require("../models/dataModel");
const postModel = require("../models/postModel");
const {v4: uuidV4} = require("uuid");
const {orderModel} = require("../models/paymentModel");
const FRONTEND_URL = process.env.FRONTEND_URL;
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
		
		const {cart, notes} = req.body;
		const orderPayload = [];
		const currency = "INR";
		const receipt = uuidV4();
		for(let i=0; i < cart.length; i++) {
			const itemData = await postModel.findOne({postName:cart[i].name});
			orderPayload.push({
				item_id:itemData?._id,
				item_name:itemData?.postName,
				item_price:parseInt(itemData?.postData?.specialprice)
			})
		}
		console.log('orderPayload',orderPayload)
		const order = await razorpayInstance.orders.create({
			amount:(orderPayload.reduce((acc, current) => (acc+current.item_price), 0))*100,
			currency: currency || "INR",
			receipt:receipt,
			notes:notes
		});
		
		const newOrder = new orderModel({
			id:order.id,
			receipt:receipt
		});
		await newOrder.save();
		res.status(200).json({ success: true, message: 'Order created', order: order, key_id:process.env.key_id })
	} catch (error) {
		console.log(error);
		res.status(500).json({ success: false, error: error })
	}
}

exports.verifyPayment = async (req, res) => {
	try {
		
		// getting the details back from our font-end
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
		const {receipt} = req.body;
		const localOrder = await orderModel.findOne({receipt});
		if(!localOrder) return res.status(400).json({success:false, message:"Bad receipt"});
		const order = await razorpayInstance.orders.fetch(localOrder.id);
		if(order){
			const paymentDetails = await razorpayInstance.orders.fetchPayments(order.id);
			res.status(200).json({success:true, payment:paymentDetails?.items});
		} else {
			res.status(400).json({sucess:false, message:"Failed to get order details."})
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