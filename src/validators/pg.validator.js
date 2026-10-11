const { body } = require("express-validator");
const { FACILITIES } = require("../enums/facilities");

function parseFacilities(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to comma-separated parsing
    }
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

const pgValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("type").isMongoId().withMessage("A valid PG type is required"),
  body("sharing").optional({ checkFalsy: true }).trim(),
  body("area").trim().notEmpty().withMessage("Area is required"),
  body("landmark").optional({ checkFalsy: true }).trim(),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("pincode")
    .trim()
    .matches(/^\d{4,10}$/)
    .withMessage("Enter a valid pincode"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number").toFloat(),
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
  body("status").optional().isIn(["available", "not available"]).withMessage("Invalid status"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("bed").isInt({ min: 0 }).withMessage("Beds must be 0 or more").toInt(),
  body("bathroom").isInt({ min: 0 }).withMessage("Bathrooms must be 0 or more").toInt(),
  body("kitchen").isInt({ min: 0 }).withMessage("Kitchen count must be 0 or more").toInt(),
  body("balcony").isInt({ min: 0 }).withMessage("Balcony count must be 0 or more").toInt(),
  body("parking").isInt({ min: 0 }).withMessage("Parking count must be 0 or more").toInt(),
  body("facilities")
    .customSanitizer(parseFacilities)
    .custom((values) => values.every((value) => FACILITIES.includes(value)))
    .withMessage("Facilities must be selected from the supported list"),
];

module.exports = { pgValidators };
