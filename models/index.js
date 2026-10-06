import User from "./User.js";
import Product from "./Product.js";
import ProductImage from "./ProductImage.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

// -----------------------------
// PRODUCT -> PRODUCT IMAGES
// -----------------------------

Product.hasMany(ProductImage, {
  foreignKey: "productId",
  as: "images",
  onDelete: "CASCADE",
});

ProductImage.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// -----------------------------
// USER -> ORDERS
// -----------------------------

User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// -----------------------------
// ORDER -> ORDER ITEMS
// -----------------------------

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// -----------------------------
// PRODUCT -> ORDER ITEMS
// -----------------------------

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

export { User, Product, ProductImage, Order, OrderItem };
