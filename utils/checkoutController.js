// Destructure the functions from flutterwaveController.js
const {
  createCustomer,
  createPaymentMethod,
  initiateCharge,
  authorizeCharge,
  verifyTransaction
} = require('./flutterwaveController')

exports.checkout = async (req, res) => {
  const { email, cart, currency, cardNonce, redirect_url } = req.body
  // Step 1 → Step 5 flow
  const customer = await createCustomer({ email })

  //step2
  const paymentMethod = await createPaymentMethod({ cardNonce })
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const reference = `ref-${Date.now()}`
  //step3
  const charge = await initiateCharge({
    customer_id: customer.id,
    payment_method_id: paymentMethod.id,
    amount: totalAmount,
    currency,
    reference,
    redirect_url
  })

  // Optional Step 4 if required by Flutterwave
  let authorizedCharge
  if (charge.next_action) {
    const authData = getAuthDataFromFrontend() // e.g., PIN/OTP from frontend
    authorizedCharge = await authorizeCharge({
      chargeId: charge.id,
      authorization: authData
    })
  }

  //step5
  const verified = await verifyTransaction({ reference })
  return res.json({ success: true, verified, cart })
}



