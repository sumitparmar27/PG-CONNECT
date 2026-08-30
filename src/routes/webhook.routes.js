const express = require("express");
const webhookController = require("../controllers/webhook.controller");

const router = express.Router();

// Raw body is required here (before the app-wide express.json()) because Razorpay's
// signature is an HMAC over the exact request bytes, not the re-serialized JSON.
router.post("/razorpay", express.raw({ type: "application/json" }), webhookController.razorpay);

module.exports = router;
