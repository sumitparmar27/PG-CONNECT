const { body } = require("express-validator");
const { pgValidators } = require("./pg.validator");

const updateUserRoleValidators = [body("role").trim().notEmpty().withMessage("A role is required")];

const updateUserStatusValidators = [
  body("isActive").isBoolean().withMessage("isActive must be a boolean").toBoolean(),
];

const moderationValidators = [
  body("status").isIn(["approved", "rejected"]).withMessage("Invalid moderation status"),
];

const createUserValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional({ checkFalsy: true }).trim(),
];

const createListingValidators = [
  ...pgValidators,
  body("ownerId").isMongoId().withMessage("An existing owner must be selected"),
];

const createBookingValidators = [
  body("pgId").isMongoId().withMessage("A valid listing is required"),
  body("roomId").isMongoId().withMessage("A valid room is required"),
  body("tenantId").isMongoId().withMessage("A valid tenant is required"),
  body("amount").optional().isFloat({ min: 0 }).withMessage("Amount must be a positive number").toFloat(),
  body("tenantPhone").optional({ checkFalsy: true }).trim(),
  body("checkIn").isISO8601().withMessage("A valid check-in date is required").toDate(),
  body("checkOut")
    .isISO8601()
    .withMessage("A valid check-out date is required")
    .toDate()
    .custom((checkOut, { req }) => checkOut > req.body.checkIn)
    .withMessage("Check-out date must be after check-in date"),
  body("securityDeposit")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Security deposit must be a positive number")
    .toFloat(),
  body("paymentMode")
    .optional({ checkFalsy: true })
    .isIn(["cash", "upi", "bank_transfer", "cheque", "other"])
    .withMessage("Invalid payment mode"),
  body("notes").optional({ checkFalsy: true }).trim(),
];

module.exports = {
  updateUserRoleValidators,
  updateUserStatusValidators,
  moderationValidators,
  createUserValidators,
  createListingValidators,
  createBookingValidators,
};
