const { validationResult } = require("express-validator");
const roomService = require("../services/room.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

const listForPg = asyncHandler(async (req, res) => {
  const rooms = await roomService.listRoomsForPg(req.params.pgId);
  res.status(200).json({ rooms });
});

const create = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const room = await roomService.createRoom(req.user._id, req.params.pgId, req.body);
  res.status(201).json({ room });
});

const update = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const room = await roomService.updateRoom(req.user._id, req.params.id, req.body);
  res.status(200).json({ room });
});

const remove = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.user._id, req.params.id);
  res.status(204).send();
});

const availability = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    throw new ApiError(422, "from and to query params are required");
  }
  const result = await roomService.getRoomAvailability(req.params.id, from, to);
  res.status(200).json({ availability: result });
});

module.exports = { listForPg, create, update, remove, availability };
