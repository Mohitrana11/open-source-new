import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  getUserDetails,
  usersDetails,
  updateUserDetails,
  resetPassword,
  requestPasswordReset,
} from "../controllers/userController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

// User registration route
router.post("/register", upload.single("photo"), register);

// User login route
router.post("/login", login);

// User logout route
router.post("/logout", logout);

// Update user details route
router.put("/update/:id", isAuthenticated, updateUserDetails);

// Get user details route
router.get("/me/:id", isAuthenticated, getUserDetails);

// Get all users details route (admin only)
router.get("/all", isAuthenticated, isAdmin, usersDetails);

// Password reset routes
router.post("/password/reset", requestPasswordReset);
router.put("/password/reset/:token", resetPassword);

export default router;
