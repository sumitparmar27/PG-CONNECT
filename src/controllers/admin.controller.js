const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const pgService = require("../services/pg.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

function toNumberOrUndefined(value) {
  return value === undefined || value === "" ? undefined : Number(value);
}

const stats = asyncHandler(async (req, res) => {
  const data = await adminService.getPlatformStats();
  res.status(200).json({ stats: data });
});

const analytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics();
  res.status(200).json({ analytics: data });
});

const listUsers = asyncHandler(async (req, res) => {
  const { q, role, status, page, limit } = req.query;
  const result = await adminService.listUsers({
    q: q || undefined,
    role: role || undefined,
    status: status || undefined,
    page: toNumberOrUndefined(page),
    limit: toNumberOrUndefined(limit),
  });
  res.status(200).json(result);
});

const updateUserRole = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const user = await adminService.updateUserRole(req.user._id, req.params.id, req.body.role);
  res.status(200).json({ user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const user = await adminService.setUserActive(req.user._id, req.params.id, req.body.isActive);
  res.status(200).json({ user });
});

const listListings = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await pgService.listForModeration({
    status: status || undefined,
    page: toNumberOrUndefined(page),
    limit: toNumberOrUndefined(limit),
  });
  res.status(200).json(result);
});

const setListingModeration = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const pg = await pgService.setModerationStatus(req.params.id, req.body.status);
  res.status(200).json({ pg });
});

module.exports = {
  stats,
  analytics,
  listUsers,
  updateUserRole,
  updateUserStatus,
  listListings,
  setListingModeration,
};
