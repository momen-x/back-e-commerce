import express from "express";
import { loginUser, logout, registerUser } from "../Controller/auth";
import { forgotPassword, resetPassword } from "../Controller/password";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout",logout)
router.post("/password/forgot-password",forgotPassword);
router.post("/password/reset-password/:id/:token",resetPassword);

export default router;
