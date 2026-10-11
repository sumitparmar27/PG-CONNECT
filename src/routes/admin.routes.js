const express = require("express");
const adminController = require("../controllers/admin.controller");
const roleController = require("../controllers/role.controller");
const requireAuth = require("../middlewares/auth.middleware");
const { requirePermission, requireAnyPermission } = require("../middlewares/role.middleware");
const uploadPgMedia = require("../middlewares/upload.middleware");
const { uploadIdProof } = require("../middlewares/upload.middleware");
const { Permissions } = require("../enums/permissions");
const {
  updateUserRoleValidators,
  updateUserStatusValidators,
  moderationValidators,
  createUserValidators,
  createListingValidators,
  createBookingValidators,
} = require("../validators/admin.validator");
const { roleValidators } = require("../validators/role.validator");
const { roomValidators } = require("../validators/room.validator");

const router = express.Router();

router.use(requireAuth, requireAnyPermission(...Object.values(Permissions)));

router.get("/stats", adminController.stats);
router.get("/analytics", requirePermission(Permissions.VIEW_ANALYTICS), adminController.analytics);

router.get("/users", requirePermission(Permissions.MANAGE_USERS), adminController.listUsers);
router.post("/users", requirePermission(Permissions.MANAGE_USERS), createUserValidators, adminController.createUser);
router.patch(
  "/users/:id/role",
  requirePermission(Permissions.MANAGE_USERS),
  updateUserRoleValidators,
  adminController.updateUserRole,
);
router.patch(
  "/users/:id/status",
  requirePermission(Permissions.MANAGE_USERS),
  updateUserStatusValidators,
  adminController.updateUserStatus,
);

router.get("/listings", requirePermission(Permissions.MANAGE_LISTINGS), adminController.listListings);
router.post(
  "/listings",
  requirePermission(Permissions.MANAGE_LISTINGS),
  uploadPgMedia,
  createListingValidators,
  adminController.createListing,
);
router.put(
  "/listings/:id",
  requirePermission(Permissions.MANAGE_LISTINGS),
  uploadPgMedia,
  createListingValidators,
  adminController.updateListing,
);
router.patch(
  "/listings/:id/moderation",
  requirePermission(Permissions.MANAGE_LISTINGS),
  moderationValidators,
  adminController.setListingModeration,
);

router.get("/listings/:pgId/rooms", requirePermission(Permissions.MANAGE_LISTINGS), adminController.listRooms);
router.post(
  "/listings/:pgId/rooms",
  requirePermission(Permissions.MANAGE_LISTINGS),
  roomValidators,
  adminController.createRoom,
);
router.put(
  "/rooms/:id",
  requirePermission(Permissions.MANAGE_LISTINGS),
  roomValidators,
  adminController.updateRoom,
);
router.delete("/rooms/:id", requirePermission(Permissions.MANAGE_LISTINGS), adminController.removeRoom);

router.post(
  "/bookings",
  requirePermission(Permissions.MANAGE_BOOKINGS),
  uploadIdProof,
  createBookingValidators,
  adminController.createBooking,
);

router.get("/roles", requirePermission(Permissions.MANAGE_ROLES), roleController.list);
router.post("/roles", requirePermission(Permissions.MANAGE_ROLES), roleValidators, roleController.create);
router.put("/roles/:id", requirePermission(Permissions.MANAGE_ROLES), roleValidators, roleController.update);
router.delete("/roles/:id", requirePermission(Permissions.MANAGE_ROLES), roleController.remove);

module.exports = router;
