const Pg = require("../models/Pg.model");
const PgType = require("../models/PgType.model");
const ApiError = require("../utils/ApiError");

const PUBLIC_OWNER_FIELDS = "name email";
const PUBLIC_TYPE_FIELDS = "name";

function toMediaPaths(files) {
  const images = (files.images || []).map((file) => `/uploads/${file.filename}`);
  const video = files.video?.[0] ? `/uploads/${files.video[0].filename}` : undefined;
  return { images, video };
}

async function assertPgTypeExists(typeId) {
  const exists = await PgType.exists({ _id: typeId });
  if (!exists) {
    throw new ApiError(422, "Invalid PG type");
  }
}

async function createPg(ownerId, data, files) {
  await assertPgTypeExists(data.type);

  const { images, video } = toMediaPaths(files);
  if (images.length === 0) {
    throw new ApiError(422, "At least one image is required");
  }

  return Pg.create({ ...data, images, video, owner: ownerId });
}

async function listPgs({ area, type, minPrice, maxPrice, page, limit }) {
  const filter = {};
  if (area) filter.area = area;
  if (type) filter.type = type;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const pageNum = Math.max(1, page || 1);
  const perPage = Math.min(24, limit || 6);

  const [items, total] = await Promise.all([
    Pg.find(filter)
      .populate("type", PUBLIC_TYPE_FIELDS)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Pg.countDocuments(filter),
  ]);

  return { items, total, page: pageNum, pages: Math.max(1, Math.ceil(total / perPage)) };
}

async function listAreas() {
  return Pg.distinct("area");
}

async function getPgById(id) {
  const pg = await Pg.findById(id)
    .populate("type", PUBLIC_TYPE_FIELDS)
    .populate("owner", PUBLIC_OWNER_FIELDS);
  if (!pg) {
    throw new ApiError(404, "PG not found");
  }
  return pg;
}

async function listMyPgs(ownerId) {
  return Pg.find({ owner: ownerId }).populate("type", PUBLIC_TYPE_FIELDS).sort({ createdAt: -1 });
}

async function findOwnedPgOrThrow(id, ownerId) {
  const pg = await Pg.findById(id);
  if (!pg) {
    throw new ApiError(404, "PG not found");
  }
  if (String(pg.owner) !== String(ownerId)) {
    throw new ApiError(403, "You do not own this listing");
  }
  return pg;
}

async function updatePg(id, ownerId, data, files) {
  const pg = await findOwnedPgOrThrow(id, ownerId);
  await assertPgTypeExists(data.type);

  const { images, video } = toMediaPaths(files);

  Object.assign(pg, data);
  if (images.length > 0) pg.images = images;
  if (video) pg.video = video;

  await pg.save();
  return pg;
}

async function deletePg(id, ownerId) {
  const pg = await findOwnedPgOrThrow(id, ownerId);
  await pg.deleteOne();
}

module.exports = {
  createPg,
  listPgs,
  listAreas,
  getPgById,
  listMyPgs,
  updatePg,
  deletePg,
};
