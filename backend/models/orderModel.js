import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: { type: String, required: [true, "Please provide address"] },
      city: { type: String, required: [true, "Please provide city"] },
      state: { type: String, required: [true, "Please provide state"] },
      country: { type: String, required: [true, "Please provide country"] },
      pinCode: { type: Number, required: [true, "Please provide pinCode"] },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },

    orderItems: [
      {
        name: { type: String, required: true },
        photo: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: [true, "Please provide subtotal"],
      default: 0,
    },
    tax: { type: Number, required: [true, "Please provide tax"], default: 0 },
    shippingCharges: {
      type: Number,
      required: [true, "Please provide shipping charges"],
      default: 0,
    },
    discount: {
      type: Number,
      required: [true, "Please provide discount"],
      default: 0,
    },
    total: {
      type: Number,
      required: [true, "Please provide total"],
      default: 0,
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },

    paidAt: { type: Date },
    deliveredAt: { type: Date },
    paymentInfo: {
      id: { type: String },
      status: { type: String },
      method: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
