import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

import {
  getUsers,
  getTotalUsersCount,
  getDashboardStats,
} from "../controllers/adminController.js";

import {
  createProductController,
  getAdminProductsController,
  getAdminProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.js";

import {
  getAdminOrderDetails,
  getAdminOrders,
  changeOrderStatus,
  changePaymentStatus,
} from "../controllers/orderController.js";

import { uploadProductImages } from "../middleware/uploadProductImages.js";
import { validateProduct } from "../middleware/validateProduct.js";

const router = express.Router();

// ==================================================
// ADMIN AUTHENTICATION
// ==================================================

router.use(authenticateUser);
router.use(requireAdmin);

// ==================================================
// ADMIN DASHBOARD
// ==================================================

router.get("/dashboard", (req, res) => {
  return res.status(200).json({
    message: "Welcome to admin dashboard",
    admin: req.user,
  });
});

// Dashboard complete stats
router.get(
  "/dashboard-stats",
  getDashboardStats,
);

// Existing total users endpoint
router.get(
  "/dashboard/stats",
  getTotalUsersCount,
);

// ==================================================
// USERS
// ==================================================

router.get(
  "/users",
  getUsers,
);

// ==================================================
// PRODUCTS
// ==================================================

// GET PAGINATED PRODUCTS
// GET /api/admin/products?page=1&limit=10
router.get(
  "/products",
  getAdminProductsController,
);

// GET SINGLE PRODUCT
// GET /api/admin/products/5
router.get(
  "/products/:id",
  getAdminProductController,
);

// CREATE PRODUCT
// POST /api/admin/products
router.post(
  "/products",
  uploadProductImages,
  validateProduct,
  createProductController,
);

// UPDATE PRODUCT
// PATCH /api/admin/products/5
router.patch(
  "/products/:id",
  uploadProductImages,
  updateProductController,
);

// DELETE PRODUCT
// DELETE /api/admin/products/5
router.delete(
  "/products/:id",
  deleteProductController,
);

// ==================================================
// ORDERS
// ==================================================

// GET PAGINATED ORDERS
// GET /api/admin/orders?page=1&limit=10
router.get(
  "/orders",
  getAdminOrders,
);

// GET SINGLE ORDER
router.get(
  "/orders/:id",
  getAdminOrderDetails,
);

// UPDATE ORDER STATUS
router.patch(
  "/orders/:id/status",
  changeOrderStatus,
);

// UPDATE PAYMENT STATUS
router.patch(
  "/orders/:id/payment-status",
  changePaymentStatus,
);

export default router;