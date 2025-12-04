const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

function generateToken (user) {
  const { firstname, lastname, email, phone, address, image, role, id } = user

  if (!firstname) {
    console.log('Missing First Name feild!')
  }

  if (!lastname) {
    console.log('Missing Last Name feild!')
  }
  if (!email) {
    console.log('Missing Email feild!')
  }
  if (!phone) {
    console.log('Missing Phone  feild!')
  }
  if (!address) {
    console.log('Missing Address  feild!')
  }
  if (!image) {
    console.log('Missing Image  feild!')
  }
  if (!id) {
    console.log('Missing ID  feild!')
  }

  const payload = {
    firstname,
    lastname,
    email,
    phone,
    address,
    image,
    role,
    userId: id
  }

  const options = {
    expiresIn: '2h'
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options)
}
module.exports = { generateToken }
