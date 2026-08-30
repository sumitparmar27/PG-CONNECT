const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { createBookingValidators, verifyPaymentValidators } = require("../validators/booking.validator");
const requireAuth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const { Roles } = require("../enums/roles");

const router = express.Router();

router.post("/", requireAuth, createBookingValidators, bookingController.create);
router.post("/:id/verify", requireAuth, verifyPaymentValidators, bookingController.verify);
router.get("/mine", requireAuth, bookingController.listMine);
router.get("/owner", requireAuth, bookingController.listOwnerBookings);
router.get("/all", requireAuth, requireRole(Roles.ADMIN), bookingController.listAllBookings);
router.patch("/:id/settle", requireAuth, requireRole(Roles.ADMIN), bookingController.settle);

module.exports = router;
