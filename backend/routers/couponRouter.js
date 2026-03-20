import express from "express";
const router = express.Router();
import {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";

// Create a new coupon (admin only)
router.post("/create", isAuthenticated, isAdmin, createCoupon);

// Get all coupons (admin only)
router.get("/all", isAuthenticated, isAdmin, getCoupons);

// Get a single coupon by ID (admin only)
router.get("/:id", isAuthenticated, isAdmin, getCoupon);

// Update a coupon by ID (admin only)
router.put("/:id", isAuthenticated, isAdmin, updateCoupon);

// Delete a coupon by ID (admin only)
router.delete("/:id", isAuthenticated, isAdmin, deleteCoupon);

// Apply a coupon to an order (authenticated users)
router.post("/apply", isAuthenticated, applyCoupon);

export default router;
