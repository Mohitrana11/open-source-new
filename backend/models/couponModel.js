import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please enter the coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter the discount amount"],
      min: [0, "Amount must be >= 0"],
    },
    type: {
      type: String,
      enum: ["fixed", "percent"],
      default: "fixed",
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, "minPurchase must be >= 0"],
    },
    expiresAt: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: [0, "usageLimit must be >= 0"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "usedCount must be >= 0"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
