import asyncHandler from "express-async-handler";
import type { AuthService } from "../service/auth.js";
import { loginValidation } from "../Validations/LoginValidation.js";
import { registerValidation } from "../Validations/RegisterValidation.js";
import { AppError } from "../../../../utils/AppError.js";

export class AuthController {
  constructor(private readonly service: AuthService) {}
  registerUser = asyncHandler(async (req, res) => {
    const validation = registerValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    try {
      const { created } = await this.service.register(validation.data);
      res
        .status(created ? 201 : 200)
        .json({
          message: created
            ? "User created successfully. Please check your email to verify your account."
            : "Verification email resent. Please check your inbox.",
        });
    } catch (error) {
      if (error instanceof AppError) throw error;
      // Registration historically returns { error } for unexpected failures.
      throw new AppError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        "error",
      );
    }
  });
  loginUser = asyncHandler(async (req, res) => {
    const validation = loginValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { token, user } = await this.service.login(validation.data);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 5,
    });
    res.status(200).json({ message: "login successful", user });
  });
  logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "logged out successfully" });
  });
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token || Array.isArray(token)) {
      res.status(400).json({ error: "verification token is required" });
      return;
    }
    await this.service.verifyEmail(token);
    res.status(200).json({ message: "Email verified successfully" });
  });
}
