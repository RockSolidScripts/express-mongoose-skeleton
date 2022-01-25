// * Import NPM Modules
import express from "express";

// * Import local JS files
import authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh-token", authController.refreshToken);

export default router;
