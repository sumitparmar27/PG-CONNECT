const express = require("express");
const adminController = require("../controllers/admin.controller");
const requireAuth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const { Roles } = require("../enums/roles");

const router = express.Router();

router.get("/stats", requireAuth, requireRole(Roles.ADMIN), adminController.stats);

module.exports = router;
