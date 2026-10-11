const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "Pg", required: true },
    roomNumber: { type: String, required: true, trim: true },
    sharingType: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    rentPerBed: { type: Number, required: true, min: 0 },
    dailyRate: { type: Number, min: 0 },
    weeklyRate: { type: Number, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

roomSchema.index({ pg: 1 });

module.exports = mongoose.model("Room", roomSchema);
