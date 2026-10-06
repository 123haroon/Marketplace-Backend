import crypto from "crypto";

import sequelize from "../config/db.js";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

// --------------------------------------------------
// ORDER NUMBER
// --------------------------------------------------

function generateOrderNumber() {
  const randomPart = crypto.randomUUID().split("-")[0].toUpperCase();

  return `ORD-${randomPart}`;
}

// --------------------------------------------------
// BUY NOW
// --------------------------------------------------

export async function createBuyNowOrder({
  userId,
  productId,
  quantity,
  paymentMethod,
  shippingAddress,
}) {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.status !== "active") {
      throw new Error("Product is currently unavailable");
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} item(s) available in stock`);
    }

    const unitPrice = Number(product.salePrice ?? product.price);

    const subtotal = unitPrice * quantity;
    const deliveryCharges = 0;
    const total = subtotal + deliveryCharges;

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal,
        deliveryCharges,
        total,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        shippingName: shippingAddress.name,
        shippingPhone: shippingAddress.phone,
        shippingAddress: shippingAddress.address,
        shippingCity: shippingAddress.city,
      },
      {
        transaction,
      },
    );

    await OrderItem.create(
      {
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity,
        lineTotal: subtotal,
      },
      {
        transaction,
      },
    );

    product.stock -= quantity;

    await product.save({
      transaction,
    });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// --------------------------------------------------
// CART CHECKOUT
// --------------------------------------------------

export async function createCartOrder({
  userId,
  items,
  paymentMethod,
  shippingAddress,
}) {
  const transaction = await sequelize.transaction();

  try {
    let subtotal = 0;

    const orderItemsData = [];
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.status !== "active") {
        throw new Error(`${product.name} is currently unavailable`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Only ${product.stock} item(s) of ${product.name} available`,
        );
      }

      const unitPrice = Number(product.salePrice ?? product.price);

      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });

      productsToUpdate.push({
        product,
        quantity: item.quantity,
      });
    }

    const deliveryCharges = 0;
    const total = subtotal + deliveryCharges;

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal,
        deliveryCharges,
        total,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        shippingName: shippingAddress.name,
        shippingPhone: shippingAddress.phone,
        shippingAddress: shippingAddress.address,
        shippingCity: shippingAddress.city,
      },
      {
        transaction,
      },
    );

    const finalOrderItems = orderItemsData.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await OrderItem.bulkCreate(finalOrderItems, {
      transaction,
    });

    for (const item of productsToUpdate) {
      item.product.stock -= item.quantity;

      await item.product.save({
        transaction,
      });
    }

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// --------------------------------------------------
// USER ORDERS
// --------------------------------------------------

export async function getUserOrders(userId) {
  return await Order.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

// --------------------------------------------------
// SINGLE USER ORDER
// --------------------------------------------------

export async function getUserOrderById(userId, orderId) {
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

// --------------------------------------------------
// ADMIN - ALL ORDERS
// --------------------------------------------------

export async function getAllOrders({ page = 1, limit = 10 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await Order.findAndCountAll({
    distinct: true,

    limit: safeLimit,
    offset,

    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],

    order: [["id", "DESC"]],
  });

  return {
    orders: rows,

    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems: count,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
}

// --------------------------------------------------
// ADMIN - SINGLE ORDER
// --------------------------------------------------

export async function getAdminOrderById(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

// --------------------------------------------------
// ADMIN - UPDATE ORDER STATUS
// --------------------------------------------------

export async function updateOrderStatus(orderId, orderStatus) {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    const error = new Error("Invalid order status");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = order.orderStatus;

    // -----------------------------
    // SAME STATUS
    // -----------------------------

    if (currentStatus === orderStatus) {
      const error = new Error(`Order is already ${orderStatus}`);

      error.statusCode = 409;
      throw error;
    }

    // -----------------------------
    // STATUS TRANSITIONS
    // -----------------------------

    const statusTransitions = {
      pending: ["confirmed", "cancelled"],

      confirmed: ["processing", "cancelled"],

      processing: ["shipped", "cancelled"],

      shipped: ["delivered"],

      delivered: [],

      cancelled: [],
    };

    // THIS WAS MISSING
    const allowedNextStatuses = statusTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(orderStatus)) {
      const error = new Error(
        `Order status cannot be changed from ${currentStatus} to ${orderStatus}`,
      );

      error.statusCode = 409;
      throw error;
    }

    // -----------------------------
    // RESTORE STOCK IF CANCELLED
    // -----------------------------

    if (orderStatus === "cancelled") {
      const items = await OrderItem.findAll({
        where: {
          orderId: order.id,
        },
        transaction,
      });

      for (const item of items) {
        if (!item.productId) {
          continue;
        }

        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          continue;
        }

        product.stock += item.quantity;

        await product.save({
          transaction,
        });
      }
    }

    // -----------------------------
    // UPDATE STATUS
    // -----------------------------

    order.orderStatus = orderStatus;

    await order.save({
      transaction,
    });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// --------------------------------------------------
// ADMIN - UPDATE PAYMENT STATUS
// --------------------------------------------------

export async function updatePaymentStatus(orderId, paymentStatus) {
  const allowedStatuses = ["pending", "paid", "failed", "refunded"];

  if (!allowedStatuses.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  order.paymentStatus = paymentStatus;

  await order.save();

  return order;
}

// --------------------------------------------------
// CUSTOMER - CANCEL ORDER
// --------------------------------------------------

export async function cancelUserOrder(userId, orderId) {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      throw new Error("This order can no longer be cancelled");
    }

    const items = await OrderItem.findAll({
      where: {
        orderId: order.id,
      },
      transaction,
    });

    for (const item of items) {
      if (!item.productId) {
        continue;
      }

      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        continue;
      }

      product.stock += item.quantity;

      await product.save({
        transaction,
      });
    }

    order.orderStatus = "cancelled";

    await order.save({
      transaction,
    });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
