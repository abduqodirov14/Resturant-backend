import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderSummary,
  getOrder,
  updateOrderStatus,
  payOrder,
} from "../controllers/orders.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Public
router.post("/", asyncHandler(createOrder));

// Admin/Chef
router.get("/", requireAuth, asyncHandler(getOrders));
router.get("/summary", requireAuth, asyncHandler(getOrderSummary));
router.get("/:id", requireAuth, asyncHandler(getOrder));
router.patch("/:id/status", requireAuth, asyncHandler(updateOrderStatus));
router.post("/:id/pay", requireAuth, asyncHandler(payOrder));

export default router;
