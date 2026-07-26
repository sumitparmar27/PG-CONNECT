const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);
  return { user, token };
}

module.exports = { register, login };
