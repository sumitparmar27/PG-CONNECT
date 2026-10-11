const Room = require("../models/Room.model");
const Pg = require("../models/Pg.model");
const Booking = require("../models/Booking.model");
const pgService = require("./pg.service");
const ApiError = require("../utils/ApiError");

const ACTIVE_BOOKING_STATUSES = ["created", "paid"];

async function syncPgSummaryFromRooms(pgId) {
  const activeRooms = await Room.find({ pg: pgId, status: "active" });

  const update = { rooms: activeRooms.length };
  if (activeRooms.length > 0) {
    update.price = Math.min(...activeRooms.map((room) => room.rentPerBed));

    const dailyRates = activeRooms.map((room) => room.dailyRate).filter((value) => value != null);
    if (dailyRates.length > 0) update.dailyRate = Math.min(...dailyRates);

    const weeklyRates = activeRooms.map((room) => room.weeklyRate).filter((value) => value != null);
    if (weeklyRates.length > 0) update.weeklyRate = Math.min(...weeklyRates);
  }

  await Pg.findByIdAndUpdate(pgId, update);
}

async function getRoomOrThrow(roomId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }
  return room;
}

async function assertOwnsRoomsPg(room, ownerId) {
  await pgService.findOwnedPgOrThrow(room.pg, ownerId);
}

async function listRoomsForPg(pgId) {
  return Room.find({ pg: pgId }).sort({ roomNumber: 1 });
}

async function createRoom(ownerId, pgId, data) {
  await pgService.findOwnedPgOrThrow(pgId, ownerId);
  const room = await Room.create({ ...data, pg: pgId });
  await syncPgSummaryFromRooms(pgId);
  return room;
}

async function updateRoom(ownerId, roomId, data) {
  const room = await getRoomOrThrow(roomId);
  await assertOwnsRoomsPg(room, ownerId);
  Object.assign(room, data);
  await room.save();
  await syncPgSummaryFromRooms(room.pg);
  return room;
}

async function assertNoActiveBookings(roomId) {
  const hasActiveBooking = await Booking.exists({
    room: roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkOut: { $gt: new Date() },
  });
  if (hasActiveBooking) {
    throw new ApiError(422, "This room has active or upcoming bookings and cannot be removed");
  }
}

async function deleteRoom(ownerId, roomId) {
  const room = await getRoomOrThrow(roomId);
  await assertOwnsRoomsPg(room, ownerId);
  await assertNoActiveBookings(roomId);
  await room.deleteOne();
  await syncPgSummaryFromRooms(room.pg);
}

async function adminCreateRoom(pgId, data) {
  const pg = await Pg.findById(pgId);
  if (!pg) {
    throw new ApiError(404, "PG not found");
  }
  const room = await Room.create({ ...data, pg: pgId });
  await syncPgSummaryFromRooms(pgId);
  return room;
}

async function adminUpdateRoom(roomId, data) {
  const room = await getRoomOrThrow(roomId);
  Object.assign(room, data);
  await room.save();
  await syncPgSummaryFromRooms(room.pg);
  return room;
}

async function adminDeleteRoom(roomId) {
  const room = await getRoomOrThrow(roomId);
  await assertNoActiveBookings(roomId);
  await room.deleteOne();
  await syncPgSummaryFromRooms(room.pg);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Dates arrive as date-only ISO strings (e.g. "2026-10-01"), which JS parses as
// UTC midnight. Snapping to UTC-midnight boundaries (rather than local calendar
// methods) keeps this arithmetic correct regardless of the server's timezone.
function toUtcDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function getRoomAvailability(roomId, from, to) {
  const room = await getRoomOrThrow(roomId);
  const rangeStart = toUtcDateOnly(new Date(from));
  const rangeEnd = toUtcDateOnly(new Date(to));

  const bookings = await Booking.find({
    room: roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkIn: { $lt: rangeEnd },
    checkOut: { $gt: rangeStart },
  }).select("checkIn checkOut");

  const availability = {};
  for (let time = rangeStart.getTime(); time <= rangeEnd.getTime(); time += ONE_DAY_MS) {
    const dayStart = new Date(time);
    const dayEnd = new Date(time + ONE_DAY_MS);
    const overlapping = bookings.filter((booking) => booking.checkIn < dayEnd && booking.checkOut > dayStart).length;
    availability[dayStart.toISOString().slice(0, 10)] = Math.max(0, room.capacity - overlapping);
  }

  return availability;
}

module.exports = {
  syncPgSummaryFromRooms,
  listRoomsForPg,
  createRoom,
  updateRoom,
  deleteRoom,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom,
  getRoomAvailability,
  getRoomOrThrow,
};
