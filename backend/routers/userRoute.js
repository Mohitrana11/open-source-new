import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  getUserDetails,
  usersDetails,
} from "../controllers/userController.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";

// User registration route
router.post("/register", register);

// User login route
router.post("/login", login);

// // User logout route
router.post("/logout", isAuthenticated, logout);

// // Get user details route
router.get("/me", isAuthenticated, getUserDetails);

// // Get all users details route (admin only)
router.get("/users", isAdmin, usersDetails);

export default router;
