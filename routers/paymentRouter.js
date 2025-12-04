const express = require('express')
const { isUser } = require('../middleware/auth')
const { initializaPayment,  VerifyPayment } = require('../controllers/paymentController')

const paymentRouter = express.Router()


paymentRouter.post("/initializepayment", isUser, initializaPayment)
paymentRouter.post("/verify_payment", isUser, VerifyPayment)
module.exports = paymentRouter