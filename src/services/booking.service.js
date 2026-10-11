const Booking = require("../models/Booking.model");
const Pg = require("../models/Pg.model");
const Room = require("../models/Room.model");
const User = require("../models/User.model");
const razorpayService = require("./razorpay.service");
const { splitAmount } = require("../config/commission");
const ApiError = require("../utils/ApiError");

const ACTIVE_BOOKING_STATUSES = ["created", "paid"];

async function assertRoomAvailable(roomId, checkIn, checkOut, { excludeBookingId } = {}) {
  const room = await Room.findById(roomId);
  if (!room || room.status !== "active") {
    throw new ApiError(404, "Room not found or not available");
  }

  const query = {
    room: roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const overlapping = await Booking.countDocuments(query);
  if (overlapping >= room.capacity) {
    throw new ApiError(422, "No beds available for the selected dates");
  }

  return room;
}

function diffDays(checkIn, checkOut) {
  return Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
}

function computeBookingPricing(room, checkIn, checkOut) {
  const days = diffDays(checkIn, checkOut);

  if (room.dailyRate && days < 7) {
    return { amount: room.dailyRate * days, durationUnit: "day", durationQuantity: days };
  }
  if (room.weeklyRate && days < 30) {
    const weeks = Math.ceil(days / 7);
    return { amount: room.weeklyRate * weeks, durationUnit: "week", durationQuantity: weeks };
  }
  const months = Math.max(1, Math.round(days / 30));
  return { amount: room.rentPerBed * (days / 30), durationUnit: "month", durationQuantity: months };
}

async function createBooking(tenantId, pgId, roomId, checkIn, checkOut) {
  const pg = await Pg.findById(pgId);
  if (!pg) {
    throw new ApiError(404, "PG not found");
  }
  if (String(pg.owner) === String(tenantId)) {
    throw new ApiError(400, "You cannot book your own listing");
  }
  if (pg.status !== "available") {
    throw new ApiError(422, "This PG is not currently available");
  }

  const room = await assertRoomAvailable(roomId, checkIn, checkOut);
  if (String(room.pg) !== String(pgId)) {
    throw new ApiError(422, "Room does not belong to this listing");
  }

  const { amount, durationUnit, durationQuantity } = computeBookingPricing(room, checkIn, checkOut);
  const { platformFeeAmount, ownerPayoutAmount } = splitAmount(amount);

  const order = await razorpayService.createOrder({
    amount,
    receipt: `booking_${pg._id}_${Date.now()}`,
  });

  const booking = await Booking.create({
    pg: pg._id,
    room: room._id,
    tenant: tenantId,
    owner: pg.owner,
    amount,
    platformFeeAmount,
    ownerPayoutAmount,
    razorpayOrderId: order.id,
    checkIn,
    checkOut,
    durationUnit,
    durationQuantity,
  });

  return { booking, razorpayOrder: order };
}

async function createManualBooking({
  pgId,
  roomId,
  tenantId,
  amount,
  createdBy,
  tenantPhone,
  checkIn,
  checkOut,
  securityDeposit,
  paymentMode,
  idProofDocument,
  notes,
}) {
  const pg = await Pg.findById(pgId);
  if (!pg) {
    throw new ApiError(404, "PG not found");
  }
  const tenant = await User.findById(tenantId);
  if (!tenant) {
    throw new ApiError(404, "Tenant not found");
  }
  if (String(pg.owner) === String(tenantId)) {
    throw new ApiError(400, "The tenant cannot be this listing's owner");
  }

  const room = await assertRoomAvailable(roomId, checkIn, checkOut);
  if (String(room.pg) !== String(pgId)) {
    throw new ApiError(422, "Room does not belong to this listing");
  }

  const pricing = computeBookingPricing(room, checkIn, checkOut);
  const finalAmount = amount ?? pricing.amount;
  const { platformFeeAmount, ownerPayoutAmount } = splitAmount(finalAmount);

  const booking = await Booking.create({
    pg: pg._id,
    room: room._id,
    tenant: tenantId,
    owner: pg.owner,
    amount: finalAmount,
    platformFeeAmount,
    ownerPayoutAmount,
    status: "paid",
    source: "manual",
    createdBy,
    tenantPhone,
    checkIn,
    checkOut,
    durationUnit: pricing.durationUnit,
    durationQuantity: pricing.durationQuantity,
    securityDeposit,
    paymentMode,
    idProofDocument,
    notes,
  });

  return booking;
}

async function verifyPayment(bookingId, tenantId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  if (String(booking.tenant) !== String(tenantId)) {
    throw new ApiError(403, "This booking does not belong to you");
  }
  if (booking.razorpayOrderId !== razorpayOrderId) {
    throw new ApiError(400, "Order ID does not match this booking");
  }

  const isValid = razorpayService.verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    booking.status = "failed";
    await booking.save();
    throw new ApiError(400, "Payment verification failed");
  }

  booking.status = "paid";
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = razorpaySignature;
  await booking.save();
  return booking;
}

async function markPaidFromWebhook({ razorpayOrderId, razorpayPaymentId }) {
  const booking = await Booking.findOne({ razorpayOrderId });
  if (!booking || booking.status === "paid") return;
  booking.status = "paid";
  booking.razorpayPaymentId = razorpayPaymentId;
  await booking.save();
}

async function listMyBookings(tenantId) {
  return Booking.find({ tenant: tenantId })
    .populate("pg", "name area images price")
    .populate("room", "roomNumber sharingType rentPerBed")
    .sort({ createdAt: -1 });
}

function summarizeBookings(bookings) {
  return bookings.reduce(
    (acc, booking) => {
      acc.totalGross += booking.amount;
      acc.totalPlatformFee += booking.platformFeeAmount;
      acc.totalOwnerPayout += booking.ownerPayoutAmount;
      if (booking.payoutStatus === "pending") acc.pendingPayout += booking.ownerPayoutAmount;
      else acc.settledPayout += booking.ownerPayoutAmount;
      return acc;
    },
    { totalGross: 0, totalPlatformFee: 0, totalOwnerPayout: 0, pendingPayout: 0, settledPayout: 0 },
  );
}

async function listOwnerBookings(ownerId) {
  const bookings = await Booking.find({ owner: ownerId, status: "paid" })
    .populate("pg", "name area")
    .populate("room", "roomNumber sharingType rentPerBed")
    .populate("tenant", "name email")
    .sort({ createdAt: -1 });

  return { bookings, summary: summarizeBookings(bookings) };
}

async function listAllBookings() {
  const bookings = await Booking.find({ status: "paid" })
    .populate("pg", "name area")
    .populate("room", "roomNumber sharingType rentPerBed")
    .populate("tenant", "name email")
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  return { bookings, summary: summarizeBookings(bookings) };
}

async function markPayoutSettled(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  booking.payoutStatus = "settled";
  await booking.save();
  return booking;
}

module.exports = {
  createBooking,
  createManualBooking,
  verifyPayment,
  markPaidFromWebhook,
  listMyBookings,
  listOwnerBookings,
  listAllBookings,
  markPayoutSettled,
};
