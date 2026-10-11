const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "Pg", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    platformFeeAmount: { type: Number, required: true },
    ownerPayoutAmount: { type: Number, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    payoutStatus: { type: String, enum: ["pending", "settled"], default: "pending" },
    source: { type: String, enum: ["online", "manual"], default: "online" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tenantPhone: { type: String, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    durationUnit: { type: String, enum: ["day", "week", "month"], default: "month" },
    durationQuantity: { type: Number, min: 1, default: 1 },
    securityDeposit: { type: Number, min: 0, default: 0 },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "cheque", "other"],
      default: "cash",
    },
    idProofDocument: { type: String },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
