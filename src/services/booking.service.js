const Booking = require("../models/Booking.model");
const Pg = require("../models/Pg.model");
const razorpayService = require("./razorpay.service");
const { splitAmount } = require("../config/commission");
const ApiError = require("../utils/ApiError");

async function createBooking(tenantId, pgId) {
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

  const amount = pg.price;
  const { platformFeeAmount, ownerPayoutAmount } = splitAmount(amount);

  const order = await razorpayService.createOrder({
    amount,
    receipt: `booking_${pg._id}_${Date.now()}`,
  });

  const booking = await Booking.create({
    pg: pg._id,
    tenant: tenantId,
    owner: pg.owner,
    amount,
    platformFeeAmount,
    ownerPayoutAmount,
    razorpayOrderId: order.id,
  });

  return { booking, razorpayOrder: order };
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
    .populate("tenant", "name email")
    .sort({ createdAt: -1 });

  return { bookings, summary: summarizeBookings(bookings) };
}

async function listAllBookings() {
  const bookings = await Booking.find({ status: "paid" })
    .populate("pg", "name area")
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
  verifyPayment,
  markPaidFromWebhook,
  listMyBookings,
  listOwnerBookings,
  listAllBookings,
  markPayoutSettled,
};
