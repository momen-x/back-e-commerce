import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import { User } from "../../Models/User";
import { loginValidation } from "../Validations/LoginValidation";
import { registerValidation } from "../Validations/RegisterValidation";
import crypto from "crypto";
import { sendVerificationRegisterEmail } from "../../../../Helper/sendVerificationRegisterEmail";

/**
 * @route POST /api/users/auth/register
 * @desc Register a new user
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const validation = registerValidation.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues[0].message });
    return;
  }

  const { email, password, firstName, lastName } = validation.data;
  const isExistUser = await User.findOne({ email });

  // ── Already registered and verified ──
  if (isExistUser && isExistUser.emailVerified) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  // ── Already registered but NOT verified → resend email ──
  if (isExistUser && !isExistUser.emailVerified) {
    const token = crypto.randomBytes(32).toString("hex");
    isExistUser.emailVerificationToken = token;
    isExistUser.emailVerificationExpires = new Date(
      Date.now() + 1000 * 60 * 60,
    ); // 1 hour
    await isExistUser.save();
    await sendVerificationRegisterEmail(email, token);
    res
      .status(200)
      .json({ message: "Verification email resent. Please check your inbox." });
    return;
  }

  // ── New user ──
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  const token = crypto.randomBytes(32).toString("hex"); // ← verification token, NOT jwt!

  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    emailVerificationToken: token,
    emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });

  await user.save();
  try {
    await sendVerificationRegisterEmail(email, token);
  } catch (emailError) {
    console.error("Email sending failed:", emailError); // ← check what error appears
    res.status(201).json({
      message: "User created but email sending failed. Please contact support.",
    });
    return;
  }
  res.status(201).json({
    message:
      "User created successfully. Please check your email to verify your account.",
  });
});

/**
 * @route POST /api/users/auth/login
 * @desc Login an existing user
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validation = loginValidation.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues[0].message });
    return;
  }
  const { email, password } = validation.data;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ error: "invalid credentials" });
    return;
  }
  if (!user.emailVerified) {
    res
      .status(400)
      .json({ error: "Please verify your email before logging in" });
    return;
  }
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ error: "invalid credentials" });
    return;
  }
  const token = (user as any).generateToken();

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(200).json({
    message: "login successful",
  });
  return;
});

/**
 * @method GET @route  api/users/auth/logout
 * @description log out
 * @access just a login user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ message: "logged out successfully" });
});

/**
 * @method GET
 * @route /api/users/auth/verify/:token
 * @description verify user email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined as any;
  user.emailVerificationExpires = undefined as any;
  await user.save();

  // ✅ Return JSON, not redirect — frontend handles navigation
  res.status(200).json({ message: "Email verified successfully" });
});
