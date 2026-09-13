import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { loginValidation } from "../Validations/LoginValidation";
import { registerValidation } from "../Validations/RegisterValidation";
import { db } from "../../../../src/prisma/db";
import { Temporal } from "temporal-polyfill";

/**
 * Generate JWT
 */
const generateToken = (user: {
  id: number;
  userImageUrl: string;
  isAdmin: boolean;
}) => {
  return jwt.sign(
    {
      id: user.id,
      userImageUrl: user.userImageUrl,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "5d",
    },
  );
};

/**
 * @route POST /api/users/auth/register
 * @desc Register a new user
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {

    const validation = registerValidation.safeParse(req.body);

    if (!validation.success) {
      console.log("VALIDATION ERROR:", validation.error);

      res.status(400).json({
        error: validation.error.issues[0].message,
      });

      return;
    }

    try {
      const { email, password, firstName, lastName } = validation.data;


      const normalizedEmail = email.trim().toLowerCase();

      const userQuery = db.orm.public.User.where({
        email: normalizedEmail,
      });

      const existingUser = await userQuery.first();


      if (existingUser?.emailVerified) {
        res.status(400).json({
          error: "User already exists",
        });

        return;
      }

      if (existingUser && !existingUser.emailVerified) {
        const token = crypto.randomBytes(32).toString("hex");

 
        
 




        res.status(200).json({
          message: "Verification email resent. Please check your inbox.",
        });

        return;
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      console.log("5. password hashed");

      const token = crypto.randomBytes(32).toString("hex");

      const expiresAt = Temporal.Now.instant().add({
        hours: 1,
      });

      type UserCreateInput = Parameters<typeof db.orm.public.User.create>[0];

      const userData: UserCreateInput = {
        email: normalizedEmail,

        password: hashedPassword,

        firstName: firstName as UserCreateInput["firstName"],

        lastName: lastName as UserCreateInput["lastName"],

        userImageUrl:
          "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png",

        userImagePublicId: null,

        emailVerificationToken: token,

        emailVerificationExpires: expiresAt,
        emailVerified: true,
      };


      const createdUser = await db.orm.public.User.create(userData);



      console.log("8. verification email sent");

      res.status(201).json({
        message:
          "User created successfully. Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
);

/**
 * @route POST /api/users/auth/login
 * @desc Login user
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validation = loginValidation.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: validation.error.issues[0].message,
    });
    return;
  }

  const { email, password } = validation.data;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.orm.public.User.where({
    email: normalizedEmail,
  }).first();

  if (!user) {
    res.status(400).json({
      error: "invalid credentials",
    });
    return;
  }

  if (!user.emailVerified) {
    res.status(400).json({
      error: "Please verify your email before logging in",
    });
    return;
  }

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) {
    res.status(400).json({
      error: "invalid credentials",
    });
    return;
  }

  const token = generateToken({
    id: user.id,
    userImageUrl: user.userImageUrl,
    isAdmin: user.isAdmin,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 5,
  });

  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({
    message: "login successful",
    user: userWithoutPassword,
  });
});

/**
 * @method GET
 * @route /api/users/auth/logout
 * @description logout
 * @access Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    message: "logged out successfully",
  });
});

/**
 * @method GET
 * @route /api/users/auth/verify/:token
 * @description verify user email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token || Array.isArray(token)) {
    res.status(400).json({
      error: "verification token is required",
    });
    return;
  }

  const user = await db.orm.public.User.where((user) =>
    user.emailVerificationToken.eq(token),
  )
    .where((user) => user.emailVerificationExpires.gt(Temporal.Now.instant()))
    .first();

  if (!user) {
    res.status(400).json({
      error: "Invalid or expired token",
    });
    return;
  }

  await db.orm.public.User.where({
    id: user.id,
  }).update({
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });

  res.status(200).json({
    message: "Email verified successfully",
  });
});
