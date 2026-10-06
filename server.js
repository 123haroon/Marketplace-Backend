import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import "./models/index.js";
import sequelize from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// -----------------------------
// GLOBAL MIDDLEWARE
// -----------------------------

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

// -----------------------------
// HEALTH
// -----------------------------

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    message: "API is running",
  });
});

// -----------------------------
// ROUTES
// -----------------------------

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/orders", orderRoutes);

// -----------------------------
// 404
// Always after all routes
// -----------------------------

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

// -----------------------------
// ERROR HANDLER
// Always last
// -----------------------------

app.use(errorHandler);

// -----------------------------
// START SERVER
// -----------------------------

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);

    process.exit(1);
  }
}

startServer();
