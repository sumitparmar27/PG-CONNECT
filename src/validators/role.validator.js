const { body } = require("express-validator");
const { Permissions } = require("../enums/permissions");

const roleValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").optional({ checkFalsy: true }).trim(),
  body("permissions")
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((values) => values.every((value) => Object.values(Permissions).includes(value)))
    .withMessage("Unknown permission"),
];

module.exports = { roleValidators };
