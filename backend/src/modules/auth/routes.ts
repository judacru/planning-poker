import { Router } from "express";
import { AuthController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/verify", (req, res) => authController.verify(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));

export default router;
