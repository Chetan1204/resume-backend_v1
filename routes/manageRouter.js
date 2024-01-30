const express = require('express')
const router = express.Router()
const authRouter = require("./auth/authRouter");
const dataRouter = require("./data/dataRouter");
const pagesRouter = require("./pages/pagesRouter");
const paymentsAndOrdersRouter = require("./paymentsAndOrders/paymentsAndOrdersRouter");

// Data Management Logics:
router.use("/auth/", authRouter)
router.use("/", dataRouter)
router.use("/", pagesRouter)
router.use("/", paymentsAndOrdersRouter)
router.get("/about", (req, res)=>{
	res.render("aboutUs")
})
router.get("/support", (req, res)=>{
	res.render("supportPage")
})
router.get("/feedback", (req, res)=>{
	res.render("feedback")
})

module.exports = router
