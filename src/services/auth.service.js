const User = require("../models/User.model");
const Role = require("../models/Role.model");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

async function attachPermissions(user) {
  const role = await Role.findOne({ name: user.role });
  user.permissions = role ? role.permissions : [];
  return user;
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user: await attachPermissions(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  return { user: await attachPermissions(user), token };
}

module.exports = { register, login };
