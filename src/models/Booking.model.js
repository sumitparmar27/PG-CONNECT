const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "Pg", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    platformFeeAmount: { type: Number, required: true },
    ownerPayoutAmount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    payoutStatus: { type: String, enum: ["pending", "settled"], default: "pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
