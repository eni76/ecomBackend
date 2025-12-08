const express = require("express");
const uploads = require("../middleware/uploads");
const { registerUser, loginUser } = require("../controllers/userController");
const userRouter = express.Router();

/**
 * @swagger
 * /your-path-here:
 *   get:
 *     summary: 
 *     tags:
 *       - 
 *     parameters:
 *       - in: 
 *         name:
 *         schema:
 *           type:
 *         required:
 *         description:
 *     responses:
 *       200:
 *         description: 
 */


 //example swager template for post route

 /**
 * @swagger
 * /loginUser:
 *   post:
 *     summary: 
 *     tags:
 *       - 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exampleField:
 *                  email:
 *                 type: string
 *                  pasword:
 *                  type:string
 *     responses:
 *       200:
 *         description: Login succesful
 */

userRouter.post("/loginUser",  loginUser);
userRouter.post("/registerUser", uploads.single("image"), registerUser);

module.exports = userRouter;
