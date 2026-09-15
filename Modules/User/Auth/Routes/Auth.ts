import express from "express";
import { authController } from "../auth.module.js";

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/verify/:token", authController.verifyEmail);
router.get("/logout", authController.logout);
// router.post("/password/forgot-password", forgotPassword);
// router.post("/password/reset-password/:id/:token", resetPassword);
// router.get("/password/verify/:id/:token", verifyResetPasswordEmail);

export default router;
