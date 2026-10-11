const { validationResult } = require("express-validator");
const roleService = require("../services/role.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function throwIfInvalid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
}

const list = asyncHandler(async (req, res) => {
  const roles = await roleService.listRoles();
  res.status(200).json({ roles });
});

const create = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const role = await roleService.createRole(req.body);
  res.status(201).json({ role });
});

const update = asyncHandler(async (req, res) => {
  throwIfInvalid(req);
  const role = await roleService.updateRole(req.params.id, req.body);
  res.status(200).json({ role });
});

const remove = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id);
  res.status(204).send();
});

module.exports = { list, create, update, remove };
