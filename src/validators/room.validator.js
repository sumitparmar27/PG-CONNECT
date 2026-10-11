const { body } = require("express-validator");

const roomValidators = [
  body("roomNumber").trim().notEmpty().withMessage("Room number is required"),
  body("sharingType").trim().notEmpty().withMessage("Sharing type is required"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1").toInt(),
  body("rentPerBed").isFloat({ min: 0 }).withMessage("Rent per bed must be a positive number").toFloat(),
  body("dailyRate")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Daily rate must be a positive number")
    .toFloat(),
  body("weeklyRate")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Weekly rate must be a positive number")
    .toFloat(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { roomValidators };
