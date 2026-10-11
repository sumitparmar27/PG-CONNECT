const express = require("express");
const pgTypeController = require("../controllers/pgType.controller");
const { pgTypeValidators } = require("../validators/pgType.validator");
const requireAuth = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/role.middleware");
const { Permissions } = require("../enums/permissions");

const router = express.Router();

router.get("/", pgTypeController.list);
router.post(
  "/",
  requireAuth,
  requirePermission(Permissions.MANAGE_LISTINGS),
  pgTypeValidators,
  pgTypeController.create,
);

module.exports = router;
