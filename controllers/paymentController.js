const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { v4: uuidv4 } = require('uuid')
const dotenv = require('dotenv')
dotenv.config()

exports.initializaPayment = async (req, res) => {
  console.log('reqbdy:', req.body)

  const { email } = req.body
  console.log('secr:', process.env.FLW_SECRET_KEY)

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist'
      })
    }

    // Find user cart
    const userCart = await prisma.cart.findUnique({
      where: { userid: user.id },
      include: {
        ProducCart: {
          include: {
            product: true
          }
        }
      }
    })

    if (!userCart) {
      return res.status(400).json({
        success: false,
        message: 'User Cart does not exist'
      })
    }

    const cartItems = userCart.ProducCart
    console.log('cart:', cartItems)

    // Calculate total price
    const totalPrice = cartItems.reduce((acc, item) => {
      return acc + item.product.price * (item.quantity || 1)
    }, 0)

    // Create order ID
    const order_id = uuidv4()

    // Flutterwave payload
    const payload = {
      tx_ref: uuidv4(),
      amount: totalPrice,
      currency: 'NGN',
      redirect_url: process.env.FRONTEND_URL,
      customer: {
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        phonenumber: user.phone
      },

      meta: {
        userId: user.id,
        order_id
      },

      customizations: {
        title: 'Grandeur',
        description: 'Payment for items in cart'
      }
    }

    // Send request to Flutterwave
    const flutterRes = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await flutterRes.json()

    // Handle Flutterwave response
    if (data.status !== 'success') {
      console.log(data)
      return res.status(500).json({
        success: false,
        message: 'Payment initialization failed'
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Payment Initialized successfully',
      link: data.data.link,
      order_id
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    })
  }
}

exports.VerifyPayment = async (req, res) => {
  console.log('start')

  const { transaction_id } = req.query

  // console.log('query:', req.query)

  // const { order_id, email } = req.body

  // console.log('Flutterwave redirect data:', req.query)

  if (!transaction_id) {
    return res.status(400).json({ message: 'Missing transaction_id' })
  }

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    )

    const data = await response.json()
    console.log('data:', data)

    const id = Number(data?.data?.meta?.userId)
    console.log('id', id)
    const order_id = data?.data?.meta?.order_id

    const amount = data?.data?.amount
    const status = data?.data?.status

    //Find user
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User does not exist in Database!' })
    }

    //find users cart
    const userCart = await prisma.cart.findUnique({
      where: { userid: id },
      include: { ProducCart: { include: { product: true } } }
    })

    if (!userCart) {
      return res.status(400).json({
        success: false,
        message: 'User cart does not exist in Database!'
      })
    }

    //check for existing reciept
    const existingReciept = await prisma.receipt.findUnique({
      where: { orderId: order_id }
    })
    if (existingReciept) {
      const Reciept = await prisma.receipt.findUnique({
        where: { orderId: order_id },
        include: { receiptItems: true }
      })

      // const cartItems = await prisma.receiptItem.createMany({
      //   data: userCart.ProducCart.map(item => ({
      //     receiptId: existingReciept.id,
      //     name: item.product.name,
      //     price: item.product.price,
      //     image: item.product.image,
      //     quantity: item.quantity,
      //     total: item.quantity * item.product.price,
      //     productId: item.productid
      //   }))
      // })
      const updatedReciept = await prisma.receipt.findUnique({
        where: { orderId: order_id },
        include: { receiptItems: true }
      })

 

      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: Reciept,
        updatedReciept,

      })
    }

    const newRecipt = await prisma.receipt.create({
      data: {
        orderId: order_id,
        userId: id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: user.phone,
        amount: amount,
        transactionId: transaction_id,
        status: status
      }
    })

    const cartItems = await prisma.receiptItem.createMany({
      data: userCart.ProducCart.map(item => ({
        receiptId: newRecipt.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        total: item.quantity * item.product.price,
        productId: item.productid
      }))
    })

    if (!newRecipt) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to generate recipt!' })
    }

    // await prisma.producCart.deleteMany({
    //   where: { cartid: userCart.id }
    // })

    // await prisma.cart.delete({
    //   where: { id: userCart.id }
    // })

    const updatedReciept = await prisma.receipt.findUnique({
      where: { orderId: order_id },
      include: { receiptItems: true }
    })

    return res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: updatedReciept,

    })
  } catch (error) {
    console.log('eror', error.message)

    return res.status(500).json({ error: error.message })
  }
}
