const adminService = require("../services/admin.service");
const asyncHandler = require("../utils/asyncHandler");

const stats = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformStats();
  res.status(200).json({ stats: data });
});

module.exports = { stats };
