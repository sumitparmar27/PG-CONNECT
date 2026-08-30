const User = require("../models/User.model");
const Pg = require("../models/Pg.model");
const Booking = require("../models/Booking.model");

async function getPlatformStats() {
  const [totalUsers, totalProperties, totalBookings, paidBookings] = await Promise.all([
    User.countDocuments(),
    Pg.countDocuments(),
    Booking.countDocuments(),
    Booking.find({ status: "paid" }, "amount platformFeeAmount payoutStatus ownerPayoutAmount"),
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
  };
}

module.exports = { getPlatformStats };
