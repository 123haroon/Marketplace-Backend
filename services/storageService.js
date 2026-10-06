import cloudinary from "../config/cloudinary.js";

export function uploadProductImage(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "marketstore/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
}

export async function deleteProductImage(publicId) {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
}
