const express = require("express");
const {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const categoryRouter = express.Router();

categoryRouter.post("/createCategory", createCategory);
categoryRouter.get("/getAllCategories", getAllCategory);
categoryRouter.get("/getSingleCategory/:name", getSingleCategory);
categoryRouter.patch("/updateCategory", updateCategory);
categoryRouter.delete("/deleteCategory", deleteCategory);
module.exports = { categoryRouter };
