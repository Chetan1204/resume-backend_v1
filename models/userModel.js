const mongoose = require("mongoose");
const { CouponSchema } = require("./couponModel");

const cartItemSchema = new mongoose.Schema({
	productName:String,
	productPrice:Number,
	productQuantity:Number,
	productImage:String,
	productId:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"posts"
	}
})

const deliveryAddressSchema = new mongoose.Schema({
	addressName:String,
	addressType:{
		type:String,
		enum:["Default","Home","Work","Other"]
	},
	addressLineOne:{
		type:String,
	},
	addressLineTwo:{
		type:String,
	},
	state:{
		type:String,
	},
	city:{
		type:String,
	},
	pinCode:{
		type:Number,
	},
	country:{
		type:String,
	}
})

const ordersSchema = new mongoose.Schema({
	orderId:String,
	status:{
		type:String,
		enum:["Pending", "Completed", "Failed", "Cancelled", "Cash__Pending"],
		default:"Pending",
	},
	buyerInformation:{
		firstName:String,
		lastName:String,
		email:String,
		phone:String,
	},
	subTotal:Number,
	orderTotal:Number,
	discount:Number,
	coupon:CouponSchema,
	quantity:Number,
	orderItems:[cartItemSchema],
	shippingAddress:deliveryAddressSchema,
	billingAddress:deliveryAddressSchema,
	expressDelivery:Boolean,
	paymentMethod:String,
	preferedDateAndTime:Date,
	gstBill:{
		gstNumber:String,
		billingName:String, 
		message:String,
		notes:String,
	},
	razorpayOrderId:String,
	razorpayOrderReceipt:String,
	razorpayPaymentId:String,
},{
	timestamps:true
})


const UserSchema = new mongoose.Schema({
	userName:String,
	firstName:{
		type:String,
	},
	lastName:{ 
		type:String,
	},
	email:{
		type:String,
	},
	phone:{
		type:String,
	},
	addressLineOne:{
		type:String,
	},
	addressLineTwo:{
		type:String,
	},
	state:{
		type:String,
	},
	city:{
		type:String,
	},
	pinCode:{
		type:Number,
	},
	country:{
		type:String,
	},
	password:{
		type:String,
	},
	access_token:String,
	verificationOTP:Number,
	isVerified:{
		type:Boolean,
		default:false
	},
	status:{
		type:String,
		enum:["unverified", "verified"]
	},
	currentOrder:ordersSchema,
	placedOrders:[ordersSchema],
	cart:[cartItemSchema],
	deliveryAddresses:[deliveryAddressSchema],
	wishList:[cartItemSchema], // product ids will be stored here to reference later from the database
});



const userModel = mongoose.model("User", UserSchema);
const orderModel = mongoose.model("orders", ordersSchema);

module.exports = { userModel, orderModel}