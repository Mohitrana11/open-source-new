import crypto from "crypto";
import User from "../models/userModel.js";
import catchAsync from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendTokenResponse.js";
import cookieOptions from "../constant/cookieOptions.js";
import sendEmail from "../utils/sendEmail.js";
import { cache } from "../utils/cache.js";

// [Register User]
export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, gender, dob } = req.body;
  console.log(req.body);
  console.log(req.file);
  if (!req.file) {
    return next(new ErrorHandler("Profile photo is required", 400));
  }
  const user = await User.create({
    username,
    email,
    password,
    photo: req.file ? req.file.path : undefined,
    dob,
    gender,
  });

  const token = user.getJWTToken();
  res.cookie("token", token, cookieOptions);
  // await sendEmail({ email, emailType: "VERIFY", userId: user._id });
  user.password = undefined;
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

  const token = user.getJWTToken();
  res.cookie("token", token);
  user.password = undefined;
  await sendEmail({ email, emailType: "VERIFY", userId: user._id });
  sendResponse(res, 200, "Login successful!", {
    user,
    token,
  });
});

// [logout]
export const logout = catchAsync(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  sendResponse(res, 200, "Logout Successful!");
});

// [get user Details]
export const getUserDetails = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User id required", 400));

  if (req.user?.role !== "admin" && req.user?._id.toString() !== id) {
    return next(new ErrorHandler("Access denied", 403));
  }
  let user;
  if (cache.has(`user_${id}`)) {
    user = JSON.parse(cache.get(`user_${id}`));
  } else {
    user = await User.findById(id).select("-password").lean();
    if (user) {
      cache.set(`user_${id}`, JSON.stringify(user), 3600); // Cache for 1 hour
    }
  }

  if (!user) return next(new ErrorHandler("User not found", 404));

  sendResponse(res, 200, "User details fetched successfully!", {
    user,
  });
});

// [get all user details]
export const usersDetails = catchAsync(async (req, res) => {
  let users;
  if (cache.has("all_users")) {
    users = JSON.parse(cache.get("all_users"));
  } else {
    users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("-password")
      .lean();
    cache.set("all_users", JSON.stringify(users), 3600); // Cache for 1 hour
  }
  sendResponse(res, 200, "All user details fetched successfully!", {
    users,
  });
});

// [Update user details]
export const updateUserDetails = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User id required", 400));
  if (req.user?._id.toString() !== id) {
    return next(new ErrorHandler("Access denied", 403));
  }
  const { username, email, photo, gender, dob } = req.body;
  const updatedData = { username, email, photo, gender, dob };

  const user = await User.findByIdAndUpdate(id, updatedData).select(
    "-password",
  );

  if (!user) return next(new ErrorHandler("User not found", 404));

  cache.del(`user_${id}`);
  cache.del("all_users");

  sendResponse(res, 200, "User details updated successfully!", {
    user,
  });
});

// [Request Password Reset]
export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  // generate token and hashed token to store
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // expiry 1 hour
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = Date.now() + 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });
  await sendEmail({ email, emailType: "RESET", userId: user._id, resetToken });
  sendResponse(res, 200, "Password reset link sent to email!");
});

// [reset password]
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token) return next(new ErrorHandler("Token is required", 400));
  if (!newPassword)
    return next(new ErrorHandler("New password is required", 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  sendResponse(res, 200, "Password reset successful!", {
    user,
  });
});
