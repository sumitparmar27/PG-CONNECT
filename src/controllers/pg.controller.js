const { validationResult } = require("express-validator");
const pgService = require("../services/pg.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

function toNumberOrUndefined(value) {
  return value === undefined || value === "" ? undefined : Number(value);
}

const list = asyncHandler(async (req, res) => {
  const { area, type, minPrice, maxPrice, page, limit } = req.query;
  const result = await pgService.listPgs({
    area: area || undefined,
    type: type || undefined,
    minPrice: toNumberOrUndefined(minPrice),
    maxPrice: toNumberOrUndefined(maxPrice),
    page: toNumberOrUndefined(page),
    limit: toNumberOrUndefined(limit),
  });
  res.status(200).json(result);
});

const areas = asyncHandler(async (req, res) => {
  const areaList = await pgService.listAreas();
  res.status(200).json({ areas: areaList });
});

const getOne = asyncHandler(async (req, res) => {
  const pg = await pgService.getPgById(req.params.id);
  res.status(200).json({ pg });
});

const listMine = asyncHandler(async (req, res) => {
  const pgs = await pgService.listMyPgs(req.user._id);
  res.status(200).json({ pgs });
});

const create = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const pg = await pgService.createPg(req.user._id, req.body, req.files || {});
  res.status(201).json({ pg });
});

const update = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const pg = await pgService.updatePg(req.params.id, req.user._id, req.body, req.files || {});
  res.status(200).json({ pg });
});

const remove = asyncHandler(async (req, res) => {
  await pgService.deletePg(req.params.id, req.user._id);
  res.status(204).send();
});

module.exports = { list, areas, getOne, listMine, create, update, remove };
