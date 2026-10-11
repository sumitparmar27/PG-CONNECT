const express = require("express");
const pgController = require("../controllers/pg.controller");
const roomController = require("../controllers/room.controller");
const { pgValidators } = require("../validators/pg.validator");
const { roomValidators } = require("../validators/room.validator");
const requireAuth = require("../middlewares/auth.middleware");
const uploadPgMedia = require("../middlewares/upload.middleware");

const router = express.Router();

router.get("/", pgController.list);
router.get("/areas", pgController.areas);
router.get("/mine", requireAuth, pgController.listMine);
router.get("/:id", pgController.getOne);
router.post("/", requireAuth, uploadPgMedia, pgValidators, pgController.create);
router.put("/:id", requireAuth, uploadPgMedia, pgValidators, pgController.update);
router.delete("/:id", requireAuth, pgController.remove);

router.get("/:pgId/rooms", roomController.listForPg);
router.post("/:pgId/rooms", requireAuth, roomValidators, roomController.create);

module.exports = router;
