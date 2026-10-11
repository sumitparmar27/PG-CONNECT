const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const pgService = require("../services/pg.service");
const roomService = require("../services/room.service");
const bookingService = require("../services/booking.service");
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

const createUser = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const user = await adminService.createUser(req.body);
  res.status(201).json({ user });
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

const createListing = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { ownerId, ...data } = req.body;
  const pg = await pgService.createPg(ownerId, data, req.files || {}, { approve: true });
  res.status(201).json({ pg });
});

const updateListing = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { ownerId, ...data } = req.body;
  const pg = await pgService.adminUpdatePg(req.params.id, { ownerId, ...data }, req.files || {});
  res.status(200).json({ pg });
});

const createBooking = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const {
    pgId,
    roomId,
    tenantId,
    amount,
    tenantPhone,
    checkIn,
    checkOut,
    securityDeposit,
    paymentMode,
    notes,
  } = req.body;
  const idProofDocument = req.file ? `/uploads/${req.file.filename}` : undefined;
  const booking = await bookingService.createManualBooking({
    pgId,
    roomId,
    tenantId,
    amount,
    createdBy: req.user._id,
    tenantPhone,
    checkIn,
    checkOut,
    securityDeposit,
    paymentMode,
    idProofDocument,
    notes,
  });
  res.status(201).json({ booking });
});

const listRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.listRoomsForPg(req.params.pgId);
  res.status(200).json({ rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const room = await roomService.adminCreateRoom(req.params.pgId, req.body);
  res.status(201).json({ room });
});

const updateRoom = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const room = await roomService.adminUpdateRoom(req.params.id, req.body);
  res.status(200).json({ room });
});

const removeRoom = asyncHandler(async (req, res) => {
  await roomService.adminDeleteRoom(req.params.id);
  res.status(204).send();
});

module.exports = {
  stats,
  analytics,
  listUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  listListings,
  setListingModeration,
  createListing,
  updateListing,
  createBooking,
  listRooms,
  createRoom,
  updateRoom,
  removeRoom,
};
