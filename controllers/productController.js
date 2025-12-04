const { PrismaClient } = require("@prisma/client");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    currency,
    sizes,
    defaultSize,
    colors,
    defaultColor,
    bestSeller,
    subcategory,
    rating,
    discount,
    newArrival,
    tags,
    categoryid,
  } = req.body;

  const parsedCategoryId = parseInt(categoryid);
  const parsedprice = parseInt(price);
  const parsedrating = parseInt(rating);
  const parseddiscount = parseInt(discount);

  try {
    const requestFields = { ...req.body };
    for (let [key, value] of Object.entries(requestFields)) {
      if (!value) {
        return res
          .status(400)
          .json({ success: false, message: `Missing ${key}` });
      }
    }

    if (!categoryid) {
      return res
        .status(400)
        .json({ success: false, message: `Missing Category` });
    }

    const existingProduct = await prisma.product.findFirst({
      where: { name, categoryid: parsedCategoryId },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exist!" });
    }

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Product");
    }

    const newProduct = await prisma.product.create({
      data: {
        ...requestFields,
        categoryid: parsedCategoryId,
        price: parsedprice,
        rating: parsedrating,
        discount: parseddiscount,
        bestSeller: true,
        newArrival: true,
        image: imageUrl,
      },
    });

    if (!newProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to create Product" });
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: newProduct,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal sever error, please try again later!",
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProducts = await prisma.product.findMany();

    if (!allProducts) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to get all products!" });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrived successfully!",
      data: allProducts,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal sever error, please try again later!",
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  try {
    //check if id id missing
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Product!",
      });
    }

    //find product
    const product = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found!" });
    }

    //return the product
    return res.status(200).json({
      success: true,
      message: "Product retrived successfully!",
      data: product,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal sever error, please try again later!",
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { id, values } = req.body;
  const parsedId = parseInt(id);
  try {
    //check for existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: parsedId },
    });
    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product does not exist in database!",
      });
    }

    //update the product
    const updatedProduct = await prisma.product.update({
      where: { id: parsedId },
      data: { ...values },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal sever error, please try again later!",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.body;
  const parsedId = parseInt(id);
  try {
    //check for existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    //check exisitng
    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product does not exist in database!",
      });
    }
    //delete
    const deletedProduct = await prisma.product.delete({
      where: { id: parsedId },
    });
    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Unable to delete product!!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
      data: deletedProduct,
   
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal sever error, please try again later!",
    });
  }
};
