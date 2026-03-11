import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import { User } from "../../Models/User";
import { loginValidation } from "../Validations/LoginValidation";
import { registerValidation } from "../Validations/RegisterValidation";
import {
  forgotPasswordValidation,
  updatePasswordValidation,
} from "../Validations/PasswordValidation";
/**
 * @route POST /api/users/auth/register
 * @desc Register a new user
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const validation = registerValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { email, password, firstName, lastName } = validation.data;

    const isExistUser = await User.findOne({ email });
    if (isExistUser && isExistUser.emailVerified) {
      res.status(400).json({ error: "user already exist" });
      return;
    } else {
      if (isExistUser && !isExistUser?.emailVerified) {
        const token = (isExistUser as any).generateToken();
        //to do send email verification
        res.status(200).json({ error: "please verify your email" });
        return;
      }
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      await user.save();
      const token = (user as any).generateToken();

      res.status(201).json({
        message: "user created successfully , please verify your email",
      });

      //to do send email verification
      return;
    }
  },
);

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
    res.status(400).json({ error: "please register and verify your email" });
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
  //to do save the token in the header
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
