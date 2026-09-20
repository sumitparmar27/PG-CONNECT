const express = require("express");
const adminController = require("../controllers/admin.controller");
const requireAuth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const { Roles } = require("../enums/roles");
const {
  updateUserRoleValidators,
  updateUserStatusValidators,
  moderationValidators,
} = require("../validators/admin.validator");

const router = express.Router();

router.use(requireAuth, requireRole(Roles.ADMIN));

router.get("/stats", adminController.stats);
router.get("/analytics", adminController.analytics);

router.get("/users", adminController.listUsers);
router.patch("/users/:id/role", updateUserRoleValidators, adminController.updateUserRole);
router.patch("/users/:id/status", updateUserStatusValidators, adminController.updateUserStatus);

router.get("/listings", adminController.listListings);
router.patch("/listings/:id/moderation", moderationValidators, adminController.setListingModeration);

module.exports = router;
