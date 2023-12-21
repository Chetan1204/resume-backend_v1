const express = require('express')
const router = express.Router()
const authRouter = require("./auth/authRouter");
const dataRouter = require("./data/dataRouter");
const pagesRouter = require("./pages/pagesRouter");
const paymentsAndOrdersRouter = require("./paymentsAndOrders/paymentsAndOrdersRouter");

// Data Management Logics:
router.use("/", authRouter)
router.use("/", dataRouter)
router.use("/", pagesRouter)
router.use("/", paymentsAndOrdersRouter)

module.exports = router
