const express = require("express");
const pgController = require("../controllers/pg.controller");
const { pgValidators } = require("../validators/pg.validator");
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

module.exports = router;
