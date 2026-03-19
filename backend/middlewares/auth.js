import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "./catchAsyncError.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    const decoded = User.verifyJWTToken(token);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied: Admins only", 403));
  }
  next();
};
