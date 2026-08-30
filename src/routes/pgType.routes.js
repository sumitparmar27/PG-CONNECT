const express = require("express");
const pgTypeController = require("../controllers/pgType.controller");
const { pgTypeValidators } = require("../validators/pgType.validator");
const requireAuth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const { Roles } = require("../enums/roles");

const router = express.Router();

router.get("/", pgTypeController.list);
router.post("/", requireAuth, requireRole(Roles.ADMIN), pgTypeValidators, pgTypeController.create);

module.exports = router;
