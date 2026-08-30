const PgType = require("../models/PgType.model");
const ApiError = require("../utils/ApiError");

async function listPgTypes() {
  return PgType.find().sort({ name: 1 });
}

async function createPgType({ name }) {
  const existing = await PgType.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "This PG type already exists");
  }
  return PgType.create({ name: name.trim() });
}

module.exports = { listPgTypes, createPgType };
