import {
  createProduct,
  getProducts,
  getProductBySlug,
  getAdminProducts,
  deleteProductById,
  getAdminProductById,
  updateProductById,
} from "../services/productService.js";
export async function createProductController(req, res, next) {
  try {
    const product = await createProduct({
      productData: req.productData,
      files: req.files || [],
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
}
export async function getPublicProductsController(req, res, next) {
  try {
    const products = await getProducts({
      status: "active",
    });

    return res.status(200).json({
      products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProductController(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await getProductBySlug(slug);

    return res.status(200).json({
      product,
    });
  } catch (error) {
    next(error);
  }
}
// --------------------------------------------------
// ADMIN PRODUCTS WITH PAGINATION
// --------------------------------------------------

export async function getAdminProductsController(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAdminProducts({
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// --------------------------------------------------
// ADMIN DELETE PRODUCT
// --------------------------------------------------

export async function deleteProductController(req, res, next) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const deletedProduct = await deleteProductById(productId);

    return res.status(200).json({
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
}

// --------------------------------------------------
// ADMIN GET PRODUCT
// --------------------------------------------------

export async function getAdminProductController(req, res, next) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await getAdminProductById(productId);

    return res.status(200).json({
      product,
    });
  } catch (error) {
    next(error);
  }
}

// --------------------------------------------------
// ADMIN UPDATE PRODUCT
// --------------------------------------------------
export async function updateProductController(req, res, next) {
  try {
    const productId = Number(req.params.id);

    // --------------------------------------------------
    // PRODUCT ID
    // --------------------------------------------------

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // --------------------------------------------------
    // PRODUCT DATA
    // --------------------------------------------------

    const name = req.body.name?.trim();

    const description = req.body.description?.trim() || null;

    const price = Number(req.body.price);

    const salePrice =
      req.body.salePrice === "" || req.body.salePrice === undefined
        ? null
        : Number(req.body.salePrice);

    const stock = Number(req.body.stock);

    const status = req.body.status;

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!name) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        message: "Valid product price is required",
      });
    }

    if (
      salePrice !== null &&
      (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > price)
    ) {
      return res.status(400).json({
        message: "Sale price must be valid and cannot exceed regular price",
      });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: "Valid stock quantity is required",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid product status",
      });
    }

    // --------------------------------------------------
    // REMOVED IMAGE IDS
    // --------------------------------------------------

    let removedImageIds = [];

    if (req.body.removedImageIds) {
      try {
        const parsed =
          typeof req.body.removedImageIds === "string"
            ? JSON.parse(req.body.removedImageIds)
            : req.body.removedImageIds;

        if (!Array.isArray(parsed)) {
          return res.status(400).json({
            message: "removedImageIds must be an array",
          });
        }

        removedImageIds = parsed
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0);
      } catch {
        return res.status(400).json({
          message: "Invalid removedImageIds",
        });
      }
    }

    // --------------------------------------------------
    // UPDATE PRODUCT
    // --------------------------------------------------

    const product = await updateProductById({
      productId,

      productData: {
        name,
        description,
        price,
        salePrice,
        stock,
        status,
      },

      files: req.files || [],

      removedImageIds,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
}
