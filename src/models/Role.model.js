const mongoose = require("mongoose");
const { Permissions } = require("../enums/permissions");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (values) => values.every((value) => Object.values(Permissions).includes(value)),
        message: "Unknown permission",
      },
    },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
