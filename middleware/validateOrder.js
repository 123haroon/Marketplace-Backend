export function validateBuyNow(req, res, next) {
  const { productId, quantity, paymentMethod, shippingAddress } = req.body;

  const parsedProductId = Number(productId);
  const parsedQuantity = Number(quantity);

  // -----------------------------
  // PRODUCT ID
  // -----------------------------

  if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    return res.status(400).json({
      message: "Please provide a valid product ID",
    });
  }

  // -----------------------------
  // QUANTITY
  // -----------------------------

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({
      message: "Quantity must be at least 1",
    });
  }

  // -----------------------------
  // PAYMENT METHOD
  // -----------------------------

  const normalizedPaymentMethod = paymentMethod || "COD";

  if (!["COD"].includes(normalizedPaymentMethod)) {
    return res.status(400).json({
      message: "Invalid payment method",
    });
  }

  // -----------------------------
  // SHIPPING ADDRESS
  // -----------------------------

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  const { name, phone, address, city } = shippingAddress;

  if (!name || !phone || !address || !city) {
    return res.status(400).json({
      message: "Name, phone, address and city are required",
    });
  }

  // -----------------------------
  // CLEAN DATA
  // -----------------------------

  req.orderData = {
    productId: parsedProductId,
    quantity: parsedQuantity,
    paymentMethod: normalizedPaymentMethod,

    shippingAddress: {
      name: String(name).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
    },
  };

  next();
}

export function validateCartCheckout(req, res, next) {
  const { items, paymentMethod, shippingAddress } = req.body;

  // -----------------------------
  // ITEMS
  // -----------------------------

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Cart must contain at least one product",
    });
  }

  const cleanItems = [];

  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID in cart",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid product quantity in cart",
      });
    }

    cleanItems.push({
      productId,
      quantity,
    });
  }

  // -----------------------------
  // PAYMENT METHOD
  // -----------------------------

  const normalizedPaymentMethod = paymentMethod || "COD";

  if (!["COD"].includes(normalizedPaymentMethod)) {
    return res.status(400).json({
      message: "Invalid payment method",
    });
  }

  // -----------------------------
  // SHIPPING ADDRESS
  // -----------------------------

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  const { name, phone, address, city } = shippingAddress;

  if (!name || !phone || !address || !city) {
    return res.status(400).json({
      message: "Name, phone, address and city are required",
    });
  }

  // -----------------------------
  // CLEAN DATA
  // -----------------------------

  req.orderData = {
    items: cleanItems,
    paymentMethod: normalizedPaymentMethod,

    shippingAddress: {
      name: String(name).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
    },
  };

  next();
}
