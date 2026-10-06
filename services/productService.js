import slugify from "slugify";
import { Op } from "sequelize";

import sequelize from "../config/db.js";

import { Product, ProductImage } from "../models/index.js";

import { uploadProductImage, deleteProductImage } from "./storageService.js";

// ==================================================
// GENERATE UNIQUE SLUG
// ==================================================

async function generateUniqueSlug(name, transaction, excludeProductId = null) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = {
      slug,
    };

    // Edit ke waqt current product ko
    // duplicate slug check se exclude karo
    if (excludeProductId) {
      where.id = {
        [Op.ne]: excludeProductId,
      };
    }

    const existingProduct = await Product.findOne({
      where,
      transaction,
    });

    if (!existingProduct) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

// ==================================================
// CLEANUP CLOUDINARY IMAGES
// ==================================================

async function cleanupCloudinaryImages(images = []) {
  await Promise.allSettled(
    images
      .filter((image) => image.publicId)
      .map((image) => deleteProductImage(image.publicId)),
  );
}

// ==================================================
// CREATE PRODUCT
// ==================================================

export async function createProduct({ productData, files = [] }) {
  const uploadedImages = [];

  // --------------------------------------------------
  // IMAGE VALIDATION
  // --------------------------------------------------

  if (files.length === 0) {
    const error = new Error("At least one product image is required");

    error.statusCode = 400;

    throw error;
  }

  if (files.length > 3) {
    const error = new Error("Maximum 3 product images are allowed");

    error.statusCode = 400;

    throw error;
  }

  try {
    // --------------------------------------------------
    // 1. UPLOAD IMAGES
    // --------------------------------------------------

    for (const file of files) {
      const uploadedImage = await uploadProductImage(file);

      uploadedImages.push(uploadedImage);
    }

    // --------------------------------------------------
    // 2. CREATE PRODUCT + IMAGE RECORDS
    // --------------------------------------------------

    const product = await sequelize.transaction(async (transaction) => {
      const slug = await generateUniqueSlug(productData.name, transaction);

      const createdProduct = await Product.create(
        {
          ...productData,
          slug,
        },
        {
          transaction,
        },
      );

      const imageRecords = uploadedImages.map((image, index) => ({
        productId: createdProduct.id,

        imageUrl: image.imageUrl,

        publicId: image.publicId,

        // First image = primary
        isPrimary: index === 0,

        sortOrder: index + 1,
      }));

      await ProductImage.bulkCreate(imageRecords, {
        transaction,
      });

      return createdProduct;
    });

    // --------------------------------------------------
    // 3. RETURN COMPLETE PRODUCT
    // --------------------------------------------------

    return await Product.findByPk(product.id, {
      include: [
        {
          model: ProductImage,
          as: "images",
        },
      ],

      order: [
        [
          {
            model: ProductImage,
            as: "images",
          },
          "sortOrder",
          "ASC",
        ],
      ],
    });
  } catch (error) {
    // DB fail ho jaye to newly uploaded
    // Cloudinary images delete karo

    await cleanupCloudinaryImages(uploadedImages);

    throw error;
  }
}

// ==================================================
// PUBLIC PRODUCTS
// ==================================================

export async function getProducts({ status } = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  return await Product.findAll({
    where,

    include: [
      {
        model: ProductImage,
        as: "images",
      },
    ],

    order: [
      ["createdAt", "DESC"],

      [
        {
          model: ProductImage,
          as: "images",
        },
        "sortOrder",
        "ASC",
      ],
    ],
  });
}

// ==================================================
// PUBLIC PRODUCT BY SLUG
// ==================================================

export async function getProductBySlug(slug) {
  const product = await Product.findOne({
    where: {
      slug,
      status: "active",
    },

    include: [
      {
        model: ProductImage,
        as: "images",
      },
    ],

    order: [
      [
        {
          model: ProductImage,
          as: "images",
        },
        "sortOrder",
        "ASC",
      ],
    ],
  });

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  return product;
}

// ==================================================
// ADMIN PRODUCTS + PAGINATION
// ==================================================

export async function getAdminProducts({ page = 1, limit = 10 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await Product.findAndCountAll({
    distinct: true,

    limit: safeLimit,

    offset,

    include: [
      {
        model: ProductImage,
        as: "images",
      },
    ],

    order: [
      ["id", "DESC"],

      [
        {
          model: ProductImage,
          as: "images",
        },
        "sortOrder",
        "ASC",
      ],
    ],
  });

  return {
    products: rows,

    pagination: {
      page: safePage,

      limit: safeLimit,

      totalItems: count,

      totalPages: Math.ceil(count / safeLimit),
    },
  };
}

// ==================================================
// ADMIN GET PRODUCT BY ID
// ==================================================

export async function getAdminProductById(productId) {
  const product = await Product.findByPk(productId, {
    include: [
      {
        model: ProductImage,

        as: "images",
      },
    ],

    order: [
      [
        {
          model: ProductImage,

          as: "images",
        },
        "sortOrder",
        "ASC",
      ],
    ],
  });

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  return product;
}

// ==================================================
// ADMIN UPDATE PRODUCT
// ==================================================

export async function updateProductById({
  productId,
  productData,
  files = [],
  removedImageIds = [],
}) {
  const uploadedImages = [];

  // --------------------------------------------------
  // 1. GET PRODUCT
  // --------------------------------------------------

  const existingProduct = await Product.findByPk(productId);

  if (!existingProduct) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  // --------------------------------------------------
  // 2. GET CURRENT IMAGES
  // --------------------------------------------------

  const currentImages = await ProductImage.findAll({
    where: {
      productId,
    },

    order: [["sortOrder", "ASC"]],
  });

  // --------------------------------------------------
  // 3. NORMALIZE REMOVED IMAGE IDs
  // --------------------------------------------------

  const removeIds = new Set(
    removedImageIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0),
  );

  // Sirf isi product ki images remove hongi
  const imagesToRemove = currentImages.filter((image) =>
    removeIds.has(image.id),
  );

  const remainingImages = currentImages.filter(
    (image) => !removeIds.has(image.id),
  );

  // --------------------------------------------------
  // 4. FINAL IMAGE COUNT
  // --------------------------------------------------

  const finalImageCount = remainingImages.length + files.length;

  if (finalImageCount > 3) {
    const error = new Error("Maximum 3 product images are allowed");

    error.statusCode = 400;

    throw error;
  }

  if (finalImageCount === 0) {
    const error = new Error("Product must have at least one image");

    error.statusCode = 400;

    throw error;
  }

  try {
    // --------------------------------------------------
    // 5. UPLOAD NEW IMAGES
    // --------------------------------------------------

    for (const file of files) {
      const uploadedImage = await uploadProductImage(file);

      uploadedImages.push(uploadedImage);
    }

    // --------------------------------------------------
    // 6. DATABASE TRANSACTION
    // --------------------------------------------------

    await sequelize.transaction(async (transaction) => {
      const product = await Product.findByPk(productId, {
        transaction,
      });

      if (!product) {
        const error = new Error("Product not found");

        error.statusCode = 404;

        throw error;
      }

      // ----------------------------------------------
      // SLUG
      // ----------------------------------------------

      let slug = product.slug;

      if (productData.name && productData.name !== product.name) {
        slug = await generateUniqueSlug(
          productData.name,
          transaction,
          product.id,
        );
      }

      // ----------------------------------------------
      // UPDATE PRODUCT DATA
      // ----------------------------------------------

      await product.update(
        {
          ...productData,

          slug,
        },
        {
          transaction,
        },
      );

      // ----------------------------------------------
      // DELETE SELECTED OLD IMAGES
      // ----------------------------------------------

      if (imagesToRemove.length > 0) {
        await ProductImage.destroy({
          where: {
            productId: product.id,

            id: {
              [Op.in]: imagesToRemove.map((image) => image.id),
            },
          },

          transaction,
        });
      }

      // ----------------------------------------------
      // GET IMAGES STILL IN DATABASE
      // ----------------------------------------------

      const savedImages = await ProductImage.findAll({
        where: {
          productId: product.id,
        },

        order: [["sortOrder", "ASC"]],

        transaction,
      });

      // ----------------------------------------------
      // ADD NEW IMAGES
      // ----------------------------------------------

      if (uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((image, index) => ({
          productId: product.id,

          imageUrl: image.imageUrl,

          publicId: image.publicId,

          // Normalize below
          isPrimary: false,

          sortOrder: savedImages.length + index + 1,
        }));

        await ProductImage.bulkCreate(imageRecords, {
          transaction,
        });
      }

      // ----------------------------------------------
      // GET FINAL IMAGES
      // ----------------------------------------------

      const finalImages = await ProductImage.findAll({
        where: {
          productId: product.id,
        },

        order: [["sortOrder", "ASC"]],

        transaction,
      });

      // ----------------------------------------------
      // NORMALIZE PRIMARY + SORT ORDER
      // ----------------------------------------------

      for (let index = 0; index < finalImages.length; index += 1) {
        const image = finalImages[index];

        await image.update(
          {
            // Always 1,2,3
            sortOrder: index + 1,

            // First remaining image
            // automatically primary
            isPrimary: index === 0,
          },
          {
            transaction,
          },
        );
      }
    });

    // --------------------------------------------------
    // 7. DELETE REMOVED FILES FROM CLOUDINARY
    // --------------------------------------------------

    // DB transaction successful hone ke baad
    // hi old Cloudinary files remove karo.

    if (imagesToRemove.length > 0) {
      await cleanupCloudinaryImages(imagesToRemove);
    }

    // --------------------------------------------------
    // 8. RETURN UPDATED PRODUCT
    // --------------------------------------------------

    const updatedProduct = await Product.findByPk(productId, {
      include: [
        {
          model: ProductImage,

          as: "images",
        },
      ],

      order: [
        [
          {
            model: ProductImage,

            as: "images",
          },
          "sortOrder",
          "ASC",
        ],
      ],
    });

    if (!updatedProduct) {
      const error = new Error("Product not found");

      error.statusCode = 404;

      throw error;
    }

    return updatedProduct;
  } catch (error) {
    // --------------------------------------------------
    // CLEAN NEW CLOUDINARY IMAGES IF DB FAILED
    // --------------------------------------------------

    if (uploadedImages.length > 0) {
      await cleanupCloudinaryImages(uploadedImages);
    }

    throw error;
  }
}

// ==================================================
// DELETE PRODUCT
// ==================================================

export async function deleteProductById(productId) {
  // --------------------------------------------------
  // 1. GET PRODUCT + IMAGES
  // --------------------------------------------------

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: ProductImage,

        as: "images",
      },
    ],
  });

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  const images = product.images ?? [];

  // --------------------------------------------------
  // 2. DELETE DATABASE RECORDS
  // --------------------------------------------------

  await sequelize.transaction(async (transaction) => {
    // Delete image records

    await ProductImage.destroy({
      where: {
        productId: product.id,
      },

      transaction,
    });

    // Delete product

    await product.destroy({
      transaction,
    });
  });

  // --------------------------------------------------
  // 3. DELETE CLOUDINARY IMAGES
  // --------------------------------------------------

  await cleanupCloudinaryImages(images);

  // --------------------------------------------------
  // 4. RETURN RESULT
  // --------------------------------------------------

  return {
    id: product.id,
    name: product.name,
  };
}
