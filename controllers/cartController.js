const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.addToCart = async (req, res) => {
  console.log('body', req.body)
  const { userid, productid, color, size, quantity } = req.body
  const parseduserId = parseInt(userid)
  const parsedproductId = parseInt(productid)

  try {
    //find or create user cart
    const existingCart = await prisma.cart.upsert({
      where: { userid: parseduserId },
      update: {}, // do nothing if exists
      create: { userid: parseduserId }
    })

    //check if product exists in database
    const existingProduct = await prisma.product.findUnique({
      where: { id: parsedproductId }
    })

    //throw response if its not existing
    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product does not exist in database!'
      })
    }

    //check if item exists in the cart
    const existingCartItem = await prisma.producCart.findUnique({
      where: {
        productid_cartid: {
          productid: parsedproductId,
          cartid: existingCart.id
        }
      }
    })

    //throw a response if item exists
    if (existingCartItem) {
      return res
        .status(400)
        .json({ success: false, message: 'Item already exists in cart!' })
    }

    //add to cart
    const addedCart = await prisma.producCart.create({
      data: {
        product: { connect: { id: parsedproductId } },
        cart: { connect: { id: existingCart.id } },
        selectedcolor: color || null,
        selectedsize: size || null,
        quantity: quantity || 1
      },
      include: { product: true }
    })

    if (!addedCart) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to add cart!' })
    }

    const userCart = await prisma.cart.findUnique({
      where: { userid: parseduserId },
      include: { ProducCart: { include: { product: true } } }
    })

    //return success response
    return res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: userCart
    })
  } catch (error) {
    //log server error
    console.log(error.message)

    //send failed response to user
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later!'
    })
  }
}

exports.updateCart = async (req, res) => {
  const { userid, productid, size, color, quantity } = req.body
  console.log('reqbody:', req.body)

  const parseduserId = parseInt(userid)
  const parsedproductId = parseInt(productid)
  try {
    //find users cart
    const userCart = await prisma.cart.findUnique({
      where: { userid: parseduserId }
    })

    if (!userCart) {
      return res
        .status(400)
        .json({ success: false, message: 'User Cart does not exist!' })
    }
    //3.Find the  item (product to be updated) in product table (optional)
    const product = await prisma.product.findUnique({
      where: { id: parsedproductId }
    })
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product does not exist in database'
      })
    }

    //3.Find the  item (product to be updated) in in cartItems****
    const cartItem = await prisma.producCart.findUnique({
      where: {
        productid_cartid: {
          productid: parsedproductId,
          cartid: userCart.id
        }
      }
    })

    if (!cartItem) {
      return res.status(400).json({
        success: false,
        message: 'item does not exist in userCartItem!'
      })
    }

    //4.If quantity is provided and <= 0 delete the item ***
    if (quantity <= 0) {
      await prisma.producCart.delete({
        where: {
          productid_cartid: {
            productid: parsedproductId,
            cartid: userCart.id
          }
        }
      })

      return res
        .status(200)
        .json({ success: true, message: 'cartItem deleted successfully!' })
    }

    //where composite **
    const whereComposite = {
      productid_cartid: {
        productid: parsedproductId,
        cartid: userCart.id
      }
    }
    //5.Build update payload — include only provided fields to avoid wiping values ***
    const payload = {
      ...(quantity !== undefined && { quantity: Number(quantity) }),
      ...(size !== undefined && { selectedsize: size }),
      ...(color !== undefined && { selectedcolor: color })
    }
    //6.If no fields provided -> nothing to update
    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Nothing to update!' })
    }

    //7. Update and return the updated item (include product for front-end convenience)

    const updtedCart = await prisma.producCart.update({
      where: whereComposite,
      data: payload && { ...payload },
      include: {
        product: true
      }
    })

    const updatedUserCart = await prisma.cart.findUnique({
      where: { userid: parseduserId },
      include: { ProducCart: { include: { product: true } } }
    })

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully!',
      data: updatedUserCart
    })
  } catch (error) {
    console.log(error.message)

    //send failed response to user
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later!'
    })
  }
}

exports.deleteCart = async (req, res) => {
  console.log('del:', req.body)

  const { productid, userid } = req.body

  const parseduserId = parseInt(userid)
  const parsedproductId = parseInt(productid)
  try {
    //check if cart exist
    const exisistingCart = await prisma.cart.findUnique({
      where: { userid: parseduserId }
    })

    if (!exisistingCart) {
      return res
        .status(400)
        .json({ success: false, message: 'User Cart does not exist!' })
    }

    //check for the item
    const exisistingCartItem = await prisma.producCart.findUnique({
      where: {
        productid_cartid: {
          productid: parsedproductId,
          cartid: exisistingCart.id
        }
      }
    })

    if (!exisistingCartItem) {
      return res
        .status(400)
        .json({ success: false, message: 'Product does not exist in cart!' })
    }

    //logic if an items quantity is more than 1
    const size = undefined
    const quantity = exisistingCartItem.quantity - 1
    const color = undefined

    if (exisistingCartItem.quantity > 1) {
      //where composite **
      const whereComposite = {
        productid_cartid: {
          productid: parsedproductId,
          cartid: exisistingCart.id
        }
      }

      const payload = {
        ...(quantity !== undefined && {
          quantity: Number(quantity)
        }),
        ...(size !== undefined && { selectedsize: size }),
        ...(color !== undefined && { selectedcolor: color })
      }
      //6.If no fields provided -> nothing to update
      if (Object.keys(payload).length === 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Nothing to update!' })
      }

      //7. Update and return the updated item (include product for front-end convenience)

      const updtedCart = await prisma.producCart.update({
        where: whereComposite,
        data: payload && { ...payload },
        include: {
          product: true
        }
      })

      const updatedUserCart = await prisma.cart.findUnique({
        where: { userid: parseduserId },
        include: { ProducCart: { include: { product: true } } }
      })

      return res.status(200).json({
        success: true,
        message: 'Product deleted from cart successfully!',
        data: updatedUserCart
      })
    }

    //Delete cart
    const deleted = await prisma.producCart.delete({
      where: {
        productid_cartid: {
          cartid: exisistingCart.id,
          productid: parsedproductId
        }
      },
      include: {
        product: true
      }
    })

    const updatedUserCart = await prisma.cart.findUnique({
      where: { userid: parseduserId },
      include: { ProducCart: { include: { product: true } } }
    })

    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to delete cart!' })
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted from cart successfully!',
      data: updatedUserCart
    })
  } catch (error) {
    console.log(error.message)

    //send failed response to user
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later!'
    })
  }
}

exports.getCart = async (req, res) => {
  const { userid } = req.params
  const parseduserId = parseInt(userid)
  try {
    //find the user cart
    const userCart = await prisma.cart.findUnique({
      where: { userid: parseduserId },
      include: { ProducCart: { include: { product: true } } }
    })

    if (!userCart) {
      return res.status(400).json({
        success: false,
        message: 'User cart does not exist in database!'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User cart retrived successfully!',
      data: userCart.ProducCart
    })
  } catch (error) {
    console.log(error.message)
    //send failed response to user
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later!'
    })
  }
}
