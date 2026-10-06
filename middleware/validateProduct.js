export function validateProduct(req, res, next) {
  const { name, description, price, salePrice, stock, status } = req.body;

  // Name required
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      message: "Product name must be at least 2 characters",
    });
  }

  // Price required
  const parsedPrice = Number(price);

  if (
    price === undefined ||
    price === "" ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice < 0
  ) {
    return res.status(400).json({
      message: "Please provide a valid product price",
    });
  }

  // Stock
  const parsedStock = Number(stock ?? 0);

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({
      message: "Stock must be a non-negative integer",
    });
  }

  // Sale price optional
  let parsedSalePrice = null;

  if (salePrice !== undefined && salePrice !== "" && salePrice !== null) {
    parsedSalePrice = Number(salePrice);

    if (!Number.isFinite(parsedSalePrice) || parsedSalePrice < 0) {
      return res.status(400).json({
        message: "Please provide a valid sale price",
      });
    }

    if (parsedSalePrice >= parsedPrice) {
      return res.status(400).json({
        message: "Sale price must be less than regular price",
      });
    }
  }

  // Status optional
  const normalizedStatus = status || "active";

  if (!["active", "inactive"].includes(normalizedStatus)) {
    return res.status(400).json({
      message: "Status must be active or inactive",
    });
  }

  // Store clean data for controller/service
  req.productData = {
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : null,
    price: parsedPrice,
    salePrice: parsedSalePrice,
    stock: parsedStock,
    status: normalizedStatus,
  };

  next();
}
// export function validateProduct(req, res, next) {
//   console.log("FORM BODY:", req.body);

//   const { name, description, price, salePrice, stock, status } = req.body;

//   // baqi code...
// }
