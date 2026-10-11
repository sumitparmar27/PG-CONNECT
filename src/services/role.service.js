const Role = require("../models/Role.model");
const User = require("../models/User.model");
const { Permissions } = require("../enums/permissions");
const { Roles } = require("../enums/roles");
const ApiError = require("../utils/ApiError");

async function ensureDefaultRoles() {
  await Role.updateOne(
    { name: Roles.USER },
    {
      $setOnInsert: {
        name: Roles.USER,
        description: "Regular platform user (tenant/owner)",
        permissions: [],
        isSystem: true,
      },
    },
    { upsert: true },
  );

  await Role.updateOne(
    { name: Roles.ADMIN },
    {
      $setOnInsert: {
        name: Roles.ADMIN,
        description: "Full administrator access",
        permissions: Object.values(Permissions),
        isSystem: true,
      },
    },
    { upsert: true },
  );
}

async function listRoles() {
  const roles = await Role.find().sort({ name: 1 });
  const counts = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
  const countByRole = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  return roles.map((role) => ({
    ...role.toObject(),
    userCount: countByRole[role.name] || 0,
  }));
}

async function createRole({ name, description, permissions }) {
  const existing = await Role.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "A role with this name already exists");
  }
  return Role.create({ name: name.trim(), description, permissions });
}

async function updateRole(id, { name, description, permissions }) {
  const role = await Role.findById(id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }
  if (role.isSystem) {
    throw new ApiError(400, "Built-in roles cannot be modified");
  }

  const existing = await Role.findOne({ name: name.trim(), _id: { $ne: id } });
  if (existing) {
    throw new ApiError(409, "A role with this name already exists");
  }

  role.name = name.trim();
  role.description = description;
  role.permissions = permissions;
  await role.save();
  return role;
}

async function deleteRole(id) {
  const role = await Role.findById(id);
  if (!role) {
    throw new ApiError(404, "Role not found");
  }
  if (role.isSystem) {
    throw new ApiError(400, "Built-in roles cannot be deleted");
  }
  const assignedCount = await User.countDocuments({ role: role.name });
  if (assignedCount > 0) {
    throw new ApiError(409, "Reassign users off this role before deleting it");
  }
  await role.deleteOne();
}

async function roleExists(name) {
  return Role.exists({ name });
}

module.exports = {
  ensureDefaultRoles,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  roleExists,
};
