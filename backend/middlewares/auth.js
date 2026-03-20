import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "./catchAsyncError.js";

const isAuthenticated = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return next(new ErrorHandler("Invalid token", 401));
  }
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User  not found", 404));
  }
  next();
});

const isAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied, admin only", 403));
  }
  next();
});

export { isAuthenticated, isAdmin };
