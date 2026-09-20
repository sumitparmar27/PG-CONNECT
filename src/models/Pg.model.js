const mongoose = require("mongoose");
const { FACILITIES } = require("../enums/facilities");

const pgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: mongoose.Schema.Types.ObjectId, ref: "PgType", required: true },
    sharing: { type: String, trim: true },
    area: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["available", "not available"], default: "available" },
    moderationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    description: { type: String, required: true },
    rooms: { type: Number, required: true, min: 0 },
    bed: { type: Number, required: true, min: 0 },
    bathroom: { type: Number, required: true, min: 0 },
    kitchen: { type: Number, required: true, min: 0 },
    balcony: { type: Number, required: true, min: 0 },
    parking: { type: Number, required: true, min: 0 },
    facilities: {
      type: [String],
      default: [],
      validate: {
        validator: (values) => values.every((value) => FACILITIES.includes(value)),
        message: "Facilities must be selected from the supported list",
      },
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (values) => values.length >= 1 && values.length <= 6,
        message: "A listing needs between 1 and 6 images",
      },
    },
    video: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

pgSchema.index({ area: 1, type: 1, price: 1 });

module.exports = mongoose.model("Pg", pgSchema);
