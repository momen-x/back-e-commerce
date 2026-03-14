import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../../Models/User";
import {
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../Validations/PasswordValidation";
import { sendVerificationResetPassword } from "../../../../Helper/sendVerificationResetPassword";

dotenv.config();

/**
 * @route Post /api/users/auth/password/forgot-password
 * @description the user will send his/her email (and then verification by his/her email)
 * @access public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const validation = forgotPasswordValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { email } = validation.data;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "user not found" });
      return;
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        password: user.password,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "10m" },
    );

    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();
    await sendVerificationResetPassword(email, token, user._id as any);
    res
      .status(200)
      .json({ message: "Verification email resent. Please check your inbox." });
    return;
  },
);

/**
 * @method GET
 * @route /api/users/auth/password/verify/:id/:token
 * @description verify user email to reset his/her password
 * @access Public
 */
export const verifyResetPasswordEmail = asyncHandler(async (req, res) => {
  const { token, id } = req.params;
  const user = await User.findOne({
    _id: id,
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }

  // user.passwordResetToken = undefined as any;
  // user.passwordResetExpires = undefined as any;
  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
});

/**
 * @route Post /api/users/auth/password/reset-password/:id/:token
 * @description reset the user password
 * @access public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const validation = resetPasswordValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { password } = validation.data;
    const { id, token } = req.params;
    if (!id || !token) {
      res.status(400).json({ error: "invalid token" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY as string,
      );
    } catch {
      res.status(400).json({ error: "invalid or expired token" });
      return;
    }
    if (!decoded) {
      res.status(400).json({ error: "invalid token" });
      return;
    }
    if ((decoded as any).id !== id) {
      res.status(400).json({ error: "invalid token" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ error: "user not found" });
      return;
    }
    if (decoded.password !== user.password) {
      res.status(400).json({ error: "reset link already used" });
      return;
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    user.password = hashedPassword;
    user.passwordResetToken = undefined as any;
    user.passwordResetExpires = undefined as any;
    await user.save();
    res.status(200).json({
      message: "Email verified successfully",
      canProceed: true, // ✅ Explicit flag
    });
    return;
  },
);
