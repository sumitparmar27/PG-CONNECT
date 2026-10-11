const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Role = require("../models/Role.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication token is missing");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }
  if (user.isActive === false) {
    throw new ApiError(403, "Your account has been suspended");
  }

  const role = await Role.findOne({ name: user.role });
  user.permissions = role ? role.permissions : [];

  req.user = user;
  next();
});

module.exports = requireAuth;
