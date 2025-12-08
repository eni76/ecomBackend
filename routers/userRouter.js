const express = require("express");
const uploads = require("../middleware/uploads");
const { registerUser, loginUser } = require("../controllers/userController");
const userRouter = express.Router();



/**
 * @swagger
 * /loginUser:
 *   post:
 *     summary: 
 *     tags:
 *       - User
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
