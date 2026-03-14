import express from "express";
import {
  loginUser,
  logout,
  registerUser,
  verifyEmail,
} from "../Controller/auth";
import {
  forgotPassword,
  resetPassword,
  verifyResetPasswordEmail,
} from "../Controller/password";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);
router.get("/logout", logout);
router.post("/password/forgot-password", forgotPassword);
router.post("/password/reset-password/:id/:token", resetPassword);
router.get("/password/verify/:id/:token", verifyResetPasswordEmail);

export default router;
