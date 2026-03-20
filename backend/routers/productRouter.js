import express from "express";
const router = express.Router();
import {
  createProduct,
  getLatestProduct,
  getAdminProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getCategoryProduct,
} from "../controllers/productController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";

// Create a new product (admin only)
router.post("/product/new", isAuthenticated, createProduct);

// Get latest products for homepage
router.get("/products/latest", isAuthenticated, getLatestProduct);

// Get all products for admin
router.get("/admin/products", isAuthenticated, isAdmin, getAdminProduct);

// Get single product details
router.get("/product/:id", getSingleProduct);

// Update a product (admin only)
router.put("/admin/product/:id", isAuthenticated, isAdmin, updateProduct);

// Delete a product (admin only)
router.delete("/admin/product/:id", isAuthenticated, isAdmin, deleteProduct);

// Get all products with search, filter, pagination
router.get("/products", isAuthenticated, getAllProduct);

// Get all categories
router.get("/products/categories", isAuthenticated, getCategoryProduct);

export default router;
