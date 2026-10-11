const { validationResult } = require("express-validator");
const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function toPublicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [] };
}

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

const register = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user: toPublicUser(user), token });
});

const login = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { user, token } = await authService.login(req.body);
  res.status(200).json({ user: toPublicUser(user), token });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: toPublicUser(req.user) });
});

module.exports = { register, login, me };
