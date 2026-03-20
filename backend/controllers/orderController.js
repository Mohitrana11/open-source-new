import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendResponse from "../utils/sendTokenResponse.js";

export const reduceStock = async (orderItems = [], session) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) return;

  for (const item of orderItems) {
    const productId = item.productId || item.product;
    const quantity = Number(item.quantity || item.qty || 0);

    if (!productId)
      throw new ErrorHandler("Invalid product in orderItems", 400);

    if (quantity <= 0)
      throw new ErrorHandler("Invalid quantity in orderItems", 400);

    const product = await Product.findById(productId)
      .select("stock name")
      .session(session);

    if (!product)
      throw new ErrorHandler(`Product not found: ${productId}`, 404);

    if (product.stock < quantity) {
      throw new ErrorHandler(`Insufficient stock for ${product.name}`, 400);
    }

    product.stock -= quantity;

    await product.save({
      validateBeforeSave: false,
      session,
    });
  }
};

//[New Order]
const newOrder = catchAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    subtotal,
    tax,
    shippingCharges = 0,
    discount = 0,
    total,
  } = req.body;

  const user = req.user._id;

  if (
    !shippingInfo ||
    !orderItems ||
    !Array.isArray(orderItems) ||
    orderItems.length === 0 ||
    !user ||
    subtotal === undefined ||
    tax === undefined ||
    total === undefined
  ) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  await reduceStock(orderItems);
  const order = await Order.create({
    shippingInfo,
    orderItems,
    user,
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
  });

  return sendResponse(res, 201, "Order placed successfully", { order });
});

// [My Orders]
const myOrders = catchAsync(async (req, res, next) => {
  const userId = req.query.id || (req.user && req.user._id);
  if (!userId) return next(new ErrorHandler("User id is required", 400));

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "User orders fetched", { orders });
});

// [All Orders]
const allOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "username email")
    .sort({ createdAt: -1 });
  return sendResponse(res, 200, "All orders fetched", { orders });
});

// [Get Single Order ]
const getSingleOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Order id is required", 400));

  const order = await Order.findById(id).populate("user", "username email");
  if (!order) return next(new ErrorHandler("Order not found", 404));

  return sendResponse(res, 200, "Order fetched", { order });
});

//[Process Order (admin)]
const processOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Order id is required", 400));

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.status === "Processing") {
    order.status = "Shipped";
  } else if (order.status === "Shipped") {
    order.status = "Delivered";
    order.deliveredAt = Date.now();
  } else {
    return sendResponse(res, 200, "Order already delivered", { order });
  }

  await order.save();
  return sendResponse(res, 200, "Order status updated", { order });
});

//[Delete Order (admin)]
const deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Order id is required", 400));

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found", 404));

  await order.deleteOne();
  return sendResponse(res, 200, "Order deleted successfully");
});

export {
  newOrder,
  myOrders,
  allOrders,
  getSingleOrder,
  processOrder,
  deleteOrder,
};
