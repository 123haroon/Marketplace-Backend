import multer from "multer";

// --------------------------------------------------
// STORAGE
// --------------------------------------------------

const storage = multer.memoryStorage();

// --------------------------------------------------
// FILE FILTER
// --------------------------------------------------

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

// --------------------------------------------------
// PRODUCT IMAGE UPLOAD
// --------------------------------------------------

export const uploadProductImages = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum 5 MB per image
    fileSize: 5 * 1024 * 1024,

    // Maximum 3 images per product
    files: 3,
  },
}).array("images", 3);
