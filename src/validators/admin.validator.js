const { body } = require("express-validator");
const { Roles } = require("../enums/roles");

const updateUserRoleValidators = [body("role").isIn(Object.values(Roles)).withMessage("Invalid role")];

const updateUserStatusValidators = [
  body("isActive").isBoolean().withMessage("isActive must be a boolean").toBoolean(),
];

const moderationValidators = [
  body("status").isIn(["approved", "rejected"]).withMessage("Invalid moderation status"),
];

module.exports = { updateUserRoleValidators, updateUserStatusValidators, moderationValidators };
