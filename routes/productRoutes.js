import express from "express";

import {
  getPublicProductsController,
  getPublicProductController,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getPublicProductsController);
router.get("/:slug", getPublicProductController);

export default router;
