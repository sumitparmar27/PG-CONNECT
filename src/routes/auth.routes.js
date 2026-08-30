const express = require("express");
const authController = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const requireAuth = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
