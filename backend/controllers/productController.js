import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middlewares/catchAsyncError.js";

import sendResponse from "../utils/sendTokenResponse.js";

const normalizePhotos = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch (e) {
      return [{ public_id: "0", url: input }];
    }
  }
  if (typeof input === "object") return [input];
  return [];
};

//[Create new product]
const createProduct = catchAsync(async (req, res, next) => {
  const { name, price, stock, description, category } = req.body;
  const photos = normalizePhotos(req.body.photos || req.body.photo);

  if (!photos || photos.length < 1)
    return next(new ErrorHandler("Please add at least one photo", 400));
  if (photos.length > 5)
    return next(new ErrorHandler("You can only upload up to 5 photos", 400));

  if (
    !name ||
    price === undefined ||
    stock === undefined ||
    !description ||
    !category
  ) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const product = await Product.create({
    name,
    photos,
    price,
    stock,
    description,
    category: String(category).toLowerCase(),
  });

  return sendResponse(res, 201, "New product created", { product });
});

//[Get latest product]
const getLatestProduct = catchAsync(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(8);
  return sendResponse(res, 200, "Latest products", {
    productCount: products.length,
    products,
  });
});

//[Get all categories]
const getCategoryProduct = catchAsync(async (req, res) => {
  const categories = await Product.distinct("category");
  return sendResponse(res, 200, "Categories fetched", { categories });
});

//[Get all products for admin]
const getAdminProduct = catchAsync(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  return sendResponse(res, 200, "All products for admin", {
    productCount: products.length,
    products,
  });
});

//[Get single product]
const getSingleProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log("Fetching product with id:", id);
  if (!id) return next(new ErrorHandler("Product id is required", 400));

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  return sendResponse(res, 200, "Product fetched", { product });
});

//[Update product]
const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params.id;
  if (!id) return next(new ErrorHandler("Product id is required", 400));

  const { name, price, stock, category, description } = req.body;
  const photos = normalizePhotos(req.body.photos || req.body.photo);

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (name) product.name = name;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (category) product.category = String(category).toLowerCase();
  if (description) product.description = description;
  if (photos && photos.length) product.photos = photos;

  await product.save();
  return sendResponse(res, 200, "Product updated successfully", { product });
});

//[Delete Product]
const deleteProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("Product id is required", 400));

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const productName = product.name;
  await Product.deleteOne({ _id: id });

  return sendResponse(res, 200, `Product ${productName} deleted Successfully`);
});

// [Get all products with search, filter, pagination]
const getAllProduct = catchAsync(async (req, res) => {
  const { search, sort, category, price } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
  const skip = (page - 1) * limit;

  const baseQuery = {};

  if (search) {
    baseQuery.$or = [
      { name: { $regex: String(search), $options: "i" } },
      { description: { $regex: String(search), $options: "i" } },
      { category: { $regex: String(search), $options: "i" } },
    ];
  }

  if (price) {
    baseQuery.price = { $lte: Number(price) };
  }

  if (category) {
    baseQuery.category = String(category).toLowerCase();
  }

  const [products, totalCount] = await Promise.all([
    Product.find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : { createdAt: -1 })
      .limit(limit)
      .skip(skip),
    Product.countDocuments(baseQuery),
  ]);

  const totalPage = Math.ceil(totalCount / limit);

  return sendResponse(res, 200, "Products fetched", {
    products,
    totalPage,
    totalCount,
    page,
  });
});

export {
  createProduct,
  getLatestProduct,
  getCategoryProduct,
  getSingleProduct,
  getAdminProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
};
