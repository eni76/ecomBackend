const express = require("express");
const uploads = require("../middleware/uploads");
const { registerUser, loginUser } = require("../controllers/userController");
const userRouter = express.Router();

userRouter.post("/loginUser",  loginUser);
userRouter.post("/registerUser", uploads.single("image"), registerUser);

module.exports = userRouter;
