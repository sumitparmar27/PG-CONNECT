const User = require("../models/User.model");
const Pg = require("../models/Pg.model");
const Booking = require("../models/Booking.model");
const roleService = require("./role.service");
const { Roles } = require("../enums/roles");
const ApiError = require("../utils/ApiError");

async function getPlatformStats() {
  const [totalUsers, totalProperties, totalBookings, paidBookings, pendingListingsCount] = await Promise.all([
    User.countDocuments(),
    Pg.countDocuments(),
    Booking.countDocuments(),
    Booking.find({ status: "paid" }, "amount platformFeeAmount payoutStatus ownerPayoutAmount"),
    Pg.countDocuments({ moderationStatus: "pending" }),
  ]);

  const totalPlatformRevenue = paidBookings.reduce((sum, b) => sum + b.platformFeeAmount, 0);
  const pendingPayoutTotal = paidBookings
    .filter((b) => b.payoutStatus === "pending")
    .reduce((sum, b) => sum + b.ownerPayoutAmount, 0);

  return {
    totalUsers,
    totalProperties,
    totalBookings,
    totalPaidBookings: paidBookings.length,
    totalPlatformRevenue,
    pendingPayoutTotal,
    pendingListingsCount,
  };
}

async function listUsers({ q, role, status, page, limit }) {
  const filter = {};
  if (q) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (role) filter.role = role;
  if (status === "active") filter.isActive = true;
  if (status === "suspended") filter.isActive = false;

  const pageNum = Math.max(1, page || 1);
  const perPage = Math.min(50, limit || 10);

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    User.countDocuments(filter),
  ]);

  return { items, total, page: pageNum, pages: Math.max(1, Math.ceil(total / perPage)) };
}

async function createUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }
  const targetRole = role || Roles.USER;
  if (!(await roleService.roleExists(targetRole))) {
    throw new ApiError(422, "Unknown role");
  }
  return User.create({ name, email, password, role: targetRole });
}

async function updateUserRole(actingAdminId, userId, role) {
  if (String(userId) === String(actingAdminId)) {
    throw new ApiError(400, "You cannot change your own role");
  }
  if (!(await roleService.roleExists(role))) {
    throw new ApiError(422, "Unknown role");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.role = role;
  await user.save();
  return user;
}

async function setUserActive(actingAdminId, userId, isActive) {
  if (String(userId) === String(actingAdminId)) {
    throw new ApiError(400, "You cannot suspend your own account");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.isActive = isActive;
  await user.save();
  return user;
}

async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [bookingsByDayRaw, listingsByAreaRaw, bookingStatusBreakdownRaw, payoutBreakdownRaw] = await Promise.all([
    Booking.aggregate([
      { $match: { status: "paid", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Pg.aggregate([
      { $group: { _id: "$area", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$payoutStatus", total: { $sum: "$ownerPayoutAmount" } } },
    ]),
  ]);

  const payoutBreakdown = payoutBreakdownRaw.reduce(
    (acc, row) => {
      if (row._id === "pending") acc.pending = row.total;
      else if (row._id === "settled") acc.settled = row.total;
      return acc;
    },
    { pending: 0, settled: 0 },
  );

  return {
    bookingsByDay: bookingsByDayRaw.map((row) => ({ date: row._id, count: row.count, revenue: row.revenue })),
    listingsByArea: listingsByAreaRaw.map((row) => ({ area: row._id || "Unspecified", count: row.count })),
    bookingStatusBreakdown: bookingStatusBreakdownRaw.map((row) => ({ status: row._id, count: row.count })),
    payoutBreakdown,
  };
}

module.exports = {
  getPlatformStats,
  listUsers,
  createUser,
  updateUserRole,
  setUserActive,
  getAnalytics,
};
