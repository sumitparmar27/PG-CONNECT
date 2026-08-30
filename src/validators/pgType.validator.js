const { body } = require("express-validator");

const pgTypeValidators = [body("name").trim().notEmpty().withMessage("Name is required")];

module.exports = { pgTypeValidators };
