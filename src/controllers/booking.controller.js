const { validationResult } = require("express-validator");
const bookingService = require("../services/booking.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

const create = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const { pgId, roomId, checkIn, checkOut } = req.body;
  const { booking, razorpayOrder } = await bookingService.createBooking(
    req.user._id,
    pgId,
    roomId,
    checkIn,
    checkOut,
  );
  res.status(201).json({
    booking,
    razorpayOrder: { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency },
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
});

const verify = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const booking = await bookingService.verifyPayment(req.params.id, req.user._id, req.body);
  res.status(200).json({ booking });
});

const listMine = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listMyBookings(req.user._id);
  res.status(200).json({ bookings });
});

const listOwnerBookings = asyncHandler(async (req, res) => {
  const { bookings, summary } = await bookingService.listOwnerBookings(req.user._id);
  res.status(200).json({ bookings, summary });
});

const listAllBookings = asyncHandler(async (req, res) => {
  const { bookings, summary } = await bookingService.listAllBookings();
  res.status(200).json({ bookings, summary });
});

const settle = asyncHandler(async (req, res) => {
  const booking = await bookingService.markPayoutSettled(req.params.id);
  res.status(200).json({ booking });
});

module.exports = { create, verify, listMine, listOwnerBookings, listAllBookings, settle };
