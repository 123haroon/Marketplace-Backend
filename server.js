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

// --------------------------------------------------
// ALLOWED FRONTEND ORIGINS
// --------------------------------------------------

const allowedOrigins = [
  "http://localhost:3000",

  process.env.FRONTEND_URL,

  "https://market-place-frontend-olive.vercel.app",

  "https://market-place-frontend-git-main-tech-ec6d.vercel.app",
].filter(Boolean);

// --------------------------------------------------
// GLOBAL MIDDLEWARE
// --------------------------------------------------

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman / server-to-server requests
      // where Origin header is missing
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(cookieParser());

// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    message: "API is running",
  });
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use(errorHandler);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

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
