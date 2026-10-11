const { body } = require("express-validator");

const createBookingValidators = [
  body("pgId").isMongoId().withMessage("A valid PG is required"),
  body("roomId").isMongoId().withMessage("A valid room is required"),
  body("checkIn").isISO8601().withMessage("A valid check-in date is required").toDate(),
  body("checkOut")
    .isISO8601()
    .withMessage("A valid check-out date is required")
    .toDate()
    .custom((checkOut, { req }) => checkOut > req.body.checkIn)
    .withMessage("Check-out date must be after check-in date"),
];

const verifyPaymentValidators = [
  body("razorpayOrderId").notEmpty().withMessage("razorpayOrderId is required"),
  body("razorpayPaymentId").notEmpty().withMessage("razorpayPaymentId is required"),
  body("razorpaySignature").notEmpty().withMessage("razorpaySignature is required"),
];

module.exports = { createBookingValidators, verifyPaymentValidators };
