import crypto from "crypto";
import User from "../models/userModel.js";
import catchAsync from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendTokenResponse.js";
import cookieOptions from "../constant/cookieOptions.js";
// [Register User]
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, photo, gender, dob } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    photo,
    gender,
    dob,
  });

  const token = user.getJWTToken();
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  sendResponse(res, 201, "User registered successfully!", { user });
});

// [Login]
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide all details", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Wrong email or password!", 400));
  }
  const isPasswordMatched = await user.compareHash(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Wrong email or password!", 400));
  }

  const userSafe = await User.findById(user._id).select("-password");
  const token = user.getJWTToken();
  res.cookie("token", token, cookieOptions);
  sendResponse(res, 200, "Login successful!", {
    user: userSafe,
    token,
  });
});

// [logout]
export const logout = catchAsync(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  sendResponse(res, 200, "Logout Successful!");
});

// [get user Details]
export const getUserDetails = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User id required", 400));

  if (req.user?.role !== "admin" && req.user?._id.toString() !== id) {
    return next(new ErrorHandler("Access denied", 403));
  }

  const user = await User.findById(id).select("-password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  sendResponse(res, 200, "User details fetched successfully!", {
    user,
  });
});

// [get all user details]
export const usersDetails = catchAsync(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id },
  })
    .select("-password")
    .lean();
  sendResponse(res, 200, "All user details fetched successfully!", {
    users,
  });
});

// [Request Password Reset]
// export const requestPasswordReset = catchAsync(async (req, res, next) => {
//   const { email } = req.body;
//   if (!email) return next(new ErrorHandler("Email is required", 400));

//   const user = await User.findOne({ email });
//   if (!user) {
//     return next(new ErrorHandler("User not found!", 404));
//   }

//   // generate token and hashed token to store
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // expiry 1 hour
//   user.forgotPasswordToken = hashedToken;
//   user.forgotPasswordTokenExpiry = Date.now() + 60 * 60 * 1000;

//   await user.save({ validateBeforeSave: false });

//   // send plain resetToken in email (so link contains it)
//   await sendEmail({ email, emailType: "RESET", userId: user._id, resetToken });

//   res.status(200).json({
//     success: true,
//     message: "Password reset email sent!",
//   });
// });

// [reset password]
// export const resetPassword = catchAsync(async (req, res, next) => {
//   const { token } = req.query;
//   const { newPassword } = req.body;

//   if (!token) return next(new ErrorHandler("Token is required", 400));
//   if (!newPassword)
//     return next(new ErrorHandler("New password is required", 400));

//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//   const user = await User.findOne({
//     forgotPasswordToken: hashedToken,
//     forgotPasswordTokenExpiry: { $gt: Date.now() },
//   }).select("+password");

//   if (!user) {
//     return next(new ErrorHandler("Invalid or expired token", 400));
//   }

//   user.password = newPassword;
//   user.forgotPasswordToken = undefined;
//   user.forgotPasswordTokenExpiry = undefined;
//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Password reset successfully!",
//   });
// });

// export default {
//   register,
//   login,
//   logout,
//   getUserDetails,
//   usersDetails,
//   // requestPasswordReset,
//   // resetPassword,
// };
