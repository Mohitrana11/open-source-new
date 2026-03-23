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

// // User logout routeQ
router.post("/logout", logout);

// // Get user details route
router.get("/me/:id", isAuthenticated, getUserDetails);

// // Get all users details route (admin only)
router.get("/all", isAuthenticated, isAdmin, usersDetails);

export default router;
