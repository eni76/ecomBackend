const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const { uploadToCloudinary } = require('../utils/uploadToCloudinary')
const { transporter, use } = require('../config/email')
const { sendVerification } = require('../utils/emailVerification')
const { generateToken } = require('../utils/generateToken')

exports.registerUser = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    address,
    password,
    confirmpassword
  } = req.body

  console.log('body', req.body)

  try {
    if (!firstname) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing First Name field!' })
    }
    if (!lastname) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Last Name field!' })
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Email field!' })
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Phone Number field!' })
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Password Number field!' })
    }

    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Adress field!' })
    }
    if (!confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing confirm password field!' })
    }

    //validating emmail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Wrong emmail format!' })
    }

    //validate pass
    const passwordRegex = /^[A-Z](?=.*[\W_])/
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: 'Wrong password format!' })
    }

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Password does not match' })
    }

    //check if user already exist

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists in database!' })
    }

    const salt = await bcrypt.genSalt(12)
    const hashedpassword = await bcrypt.hash(password, salt)

    let imageUrl

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'image', 'Users')
    }

    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        address,
        password: hashedpassword,
        image: imageUrl || null
      }
    })

    if (!newUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User creation failed' })
    }

    const verificationLink = 'https://stream-ashy-theta.vercel.app/'

    // await sendVerification(newUser.email, verificationLink)

    return res.status(201).json({
      success: true,
      message: 'User registred successfully!',
      data: newUser
    })
  } catch (error) {
    console.log('error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Interal server error, please try again later!'
    })
  }
}

exports.loginUser = async (req, res) => {
  console.log('body:', req.body)

  const { email, password } = req.body
  try {
    //check if feild are empty
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Email Feild!' })
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Password Feild!' })
    }

    //check for existing user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User With the provided email does not exist in database!'
      })
    }

    //validate Paasword
    const validatedPassword = await bcrypt.compare(password, user.password)
    if (!validatedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect Password!'
      })
    }

    const token = generateToken(user)
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or no token!'
      })
    }
    res.setHeader('Authorization', `Bearer ${token}`)
    res.setHeader('Access-Control-Expose-Headers', 'Authorization')

    return res
      .status(200)
      .json({ success: true, message: 'Login Successfull!', token })
  } catch (error) {
    console.log('error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try againg later!'
    })
  }
}
