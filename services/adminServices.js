import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export async function getAllUsers() {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  return users;
}

export async function getDashboardStatsService() {
  const totalUsers = await User.count();

  const totalProducts = await Product.count();

  const totalOrders = await Order.count();

  return {
    totalUsers,
    totalProducts,
    totalOrders,
  };
}
export async function getTotalUsers() {
  const totalUsers = await User.count();

  return totalUsers;
}
export async function getAdminUsers({ page = 1, limit = 10 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await User.findAndCountAll({
    limit: safeLimit,
    offset,

    order: [["id", "DESC"]],

    attributes: {
      exclude: ["password"],
    },
  });

  return {
    users: rows,

    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems: count,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
}
