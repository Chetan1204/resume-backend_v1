const {razorpayInstance} = require("../config/paymentGatewayConfig");

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
		const {amount, currency, receipt, notes} = req.body;
		const order = await razorpayInstance.orders.create({
			amount,
			currency,
			receipt,
			notes
		});
		res.status(200).json({success:true, message:'Order created'})
	} catch (error) {
		console.log(error);
		res.status(500).json({success:false, error:error})
	}
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
		res.status(500).json({success:false, error:error})
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
		res.status(500).json({success:false, error:error})
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
		res.status(500).json({success:false, error:error})
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
		res.status(500).json({success:false, error:error})
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
		res.status(500).json({success:false, error:error})
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
		res.status(500).json({success:false, error:error})
	}
}
