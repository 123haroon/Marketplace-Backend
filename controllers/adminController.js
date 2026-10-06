import {
  getAllUsers,
  getTotalUsers,
  getDashboardStatsService,
  getAdminUsers,
} from "../services/adminServices.js";
export async function getUsers(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const result = await getAdminUsers({
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTotalUsersCount(req, res, next) {
  try {
    const totalUsers = await getTotalUsers();
    return res.status(200).json({ totalUsers });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await getDashboardStatsService();

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}
