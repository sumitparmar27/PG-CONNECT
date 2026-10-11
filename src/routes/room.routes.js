const express = require("express");
const roomController = require("../controllers/room.controller");
const { roomValidators } = require("../validators/room.validator");
const requireAuth = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/:id/availability", roomController.availability);
router.put("/:id", requireAuth, roomValidators, roomController.update);
router.delete("/:id", requireAuth, roomController.remove);

module.exports = router;
