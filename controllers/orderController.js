import {
  createBuyNowOrder,
  createCartOrder,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelUserOrder,
  getAdminOrderById,
} from "../services/orderService.js";

export async function buyNow(req, res, next) {
  try {
    const userId = req.user.id;

    const order = await createBuyNowOrder({
      userId,
      ...req.orderData,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user.id;

    const orders = await getUserOrders(userId);

    return res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrderById(req, res, next) {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await getUserOrderById(userId, orderId);

    return res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
export async function checkoutCart(req, res, next) {
  try {
    const userId = req.user.id;

    const order = await createCartOrder({
      userId,
      ...req.orderData,
    });

    return res.status(201).json({
      message: "Cart order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllOrders({
      page,
      limit,
    });

    return res.status(200).json({
      message: "All orders fetched successfully",

      orders: result.orders,

      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeOrderStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const { orderStatus } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await updateOrderStatus(orderId, orderStatus);

    return res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
export async function changePaymentStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const { paymentStatus } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await updatePaymentStatus(orderId, paymentStatus);

    return res.status(200).json({
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
export async function cancelMyOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await cancelUserOrder(userId, orderId);

    return res.status(200).json({
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrderDetails(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await getAdminOrderById(orderId);

    return res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
