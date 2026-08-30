const { validationResult } = require("express-validator");
const pgTypeService = require("../services/pgType.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

const list = asyncHandler(async (req, res) => {
  const types = await pgTypeService.listPgTypes();
  res.status(200).json({ types });
});

const create = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const type = await pgTypeService.createPgType(req.body);
  res.status(201).json({ type });
});

module.exports = { list, create };
