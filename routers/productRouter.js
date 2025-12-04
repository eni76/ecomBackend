const express = require('express')
const uploads = require('../middleware/uploads')
const {
  createProduct,
  getAllProduct,
  updateProduct,
  getSingleProduct,
  deleteProduct
} = require('../controllers/productController')
const { isUser, isAdmin, isSameUser } = require('../middleware/auth')
const productRouter = express.Router()

productRouter.post(
  '/createProduct',
  isUser,
  isAdmin,
  uploads.single('image'),
  createProduct
)
productRouter.get('/getAllProduct', getAllProduct)
productRouter.patch('/updateProduct', isUser, isAdmin, updateProduct)
productRouter.delete('/deleteProduct', isUser, isAdmin, deleteProduct)
productRouter.get('/getsingleProduct/:id', getSingleProduct)
module.exports = productRouter
