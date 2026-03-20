import express from "express";
const router = express.Router();
import {
  newOrder,
  myOrders,
  allOrders,
  getSingleOrder,
  processOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

router.post("/order/new", isAuthenticated, newOrder);
router.post("/orders/me", isAuthenticated, myOrders);
router.get("/admin/orders", isAuthenticated, isAdmin, allOrders);
router.get("/order/:id", isAuthenticated, getSingleOrder);
router.put("/admin/order/:id", isAuthenticated, isAdmin, processOrder);
router.delete("/admin/order/:id", isAuthenticated, isAdmin, deleteOrder);

export default router;
