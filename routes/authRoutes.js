import express from "express";

import {
  signup,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";

import { validateSignup } from "../middleware/validateSignup.js";
import { validateLogin } from "../middleware/validateLogin.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
const router = express.Router();

router.post("/signup", validateSignup, signup);

router.post("/login", validateLogin, login);

router.post("/logout", logout);

router.get("/me", authenticateUser, getCurrentUser);

router.get("/admin-test", authenticateUser, requireAdmin, (req, res) => {
  return res.status(200).json({
    message: "Admin access granted",
    user: req.user,
  });
});

export default router;
