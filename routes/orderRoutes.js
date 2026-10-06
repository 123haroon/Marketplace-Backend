import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  validateBuyNow,
  validateCartCheckout,
} from "../middleware/validateOrder.js";

import {
  buyNow,
  checkoutCart,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/buy-now", authenticateUser, validateBuyNow, buyNow);

router.post(
  "/checkout-cart",
  authenticateUser,
  validateCartCheckout,
  checkoutCart,
);

router.get("/my-orders", authenticateUser, getMyOrders);

router.get("/:id", authenticateUser, getMyOrderById);
router.patch("/:id/cancel", authenticateUser, cancelMyOrder);

export default router;
