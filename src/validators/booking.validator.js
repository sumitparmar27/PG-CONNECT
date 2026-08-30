const { body } = require("express-validator");

const createBookingValidators = [body("pgId").isMongoId().withMessage("A valid PG is required")];

const verifyPaymentValidators = [
  body("razorpayOrderId").notEmpty().withMessage("razorpayOrderId is required"),
  body("razorpayPaymentId").notEmpty().withMessage("razorpayPaymentId is required"),
  body("razorpaySignature").notEmpty().withMessage("razorpaySignature is required"),
];

module.exports = { createBookingValidators, verifyPaymentValidators };
