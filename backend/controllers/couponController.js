import Coupon from "../models/couponModel.js";
import catchAsync from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendTokenResponse.js";

// [Create Coupon]
const createCoupon = catchAsync(async (req, res, next) => {
  const {
    code,
    amount,
    type = "fixed",
    minPurchase = 0,
    expiresAt,
    usageLimit = 0,
    active = true,
  } = req.body;

  if (!code || amount === undefined) {
    return next(new ErrorHandler("code and amount are required", 400));
  }

  const normalizedCode = String(code).toUpperCase().trim();

  const exists = await Coupon.findOne({ code: normalizedCode });
  if (exists) return next(new ErrorHandler("Coupon code already exists", 409));

  const coupon = await Coupon.create({
    code: normalizedCode,
    amount,
    type,
    minPurchase,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    usageLimit,
    active,
    createdBy: req.user ? req.user._id : undefined,
  });

  return sendResponse(res, 201, "Coupon created", { coupon });
});

// [Get Coupons]
const getCoupons = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.active !== undefined)
    filter.active = req.query.active === "true";
  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Coupons fetched", {
    coupons,
    count: coupons.length,
  });
});

// [ Get Single ]
const getCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { code } = req.query;

  let coupon;
  if (code) {
    coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  } else if (id) {
    coupon = await Coupon.findById(id);
  } else {
    return next(new ErrorHandler("Provide coupon id or code", 400));
  }

  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  return sendResponse(res, 200, "Coupon fetched", { coupon });
});

/// [Update Coupon]
const updateCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Coupon id required", 400));

  const update = { ...req.body };
  if (update.code) update.code = String(update.code).toUpperCase().trim();
  if (update.expiresAt) update.expiresAt = new Date(update.expiresAt);

  const coupon = await Coupon.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  return sendResponse(res, 200, "Coupon updated", { coupon });
});

// [Delete Coupon ]
const deleteCoupon = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Coupon id required", 400));
  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  await coupon.deleteOne();
  return sendResponse(res, 200, "Coupon deleted");
});

/// [Apply Coupon]
const applyCoupon = catchAsync(async (req, res, next) => {
  const { code, cartTotal } = req.body;
  if (!code || cartTotal === undefined) {
    return next(new ErrorHandler("code and cartTotal are required", 400));
  }

  const coupon = await Coupon.findOne({
    code: String(code).toUpperCase().trim(),
  });
  if (!coupon) return next(new ErrorHandler("Invalid coupon code", 404));

  if (!coupon.active)
    return next(new ErrorHandler("Coupon is not active", 400));
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now())
    return next(new ErrorHandler("Coupon expired", 400));
  if (
    coupon.usageLimit &&
    coupon.usageLimit > 0 &&
    coupon.usedCount >= coupon.usageLimit
  )
    return next(new ErrorHandler("Coupon usage limit reached", 400));
  if (coupon.minPurchase && cartTotal < coupon.minPurchase)
    return next(
      new ErrorHandler(`Minimum purchase ${coupon.minPurchase} required`, 400),
    );

  let discount = 0;
  if (coupon.type === "fixed") discount = Math.min(coupon.amount, cartTotal);
  else {
    discount = (Number(coupon.amount) / 100) * Number(cartTotal);
  }

  const totalAfter = Number(cartTotal) - discount;
  return sendResponse(res, 200, "Coupon applied", {
    coupon: {
      id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      minPurchase: coupon.minPurchase,
      expiresAt: coupon.expiresAt,
    },
    discount,
    totalAfter,
  });
});

export {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
