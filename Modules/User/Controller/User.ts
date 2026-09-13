import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";

import { updateUserInfoValidation } from "../Validations/UpdateUserInfo";
import { updatePasswordValidation } from "../Auth/Validations/PasswordValidation";

import { uploadImage, removeImage } from "../../../utils/cloudinary";

import { db } from "../../../src/prisma/db";

/**
 * @method GET
 * @route /api/users
 * @description get all users
 * @access private - admin only
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await db.orm.public.User.all();

  const usersWithoutPasswords = users.map((user) => {
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  });

  res.status(200).json({
    count: users.length,
    users: usersWithoutPasswords,
  });
});

/**
 * @method GET
 * @route /api/users/:id
 * @description get user by id
 * @access private - admin or user himself
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      error: "user id is required",
    });
    return;
  }

  const user = await db.orm.public.User.where({
    id: Number(id),
  }).first();

  if (!user) {
    res.status(404).json({
      error: "user not found",
    });
    return;
  }

  const { password, ...userWithoutPassword } = user;

  res.status(200).json(userWithoutPassword);
});

/**
 * @method GET
 * @route /api/users/me
 * @description return logged in user data
 * @access private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const decoded = (req as any).user;

  const user = await db.orm.public.User.where({
    id: Number(decoded.id),
  }).first();

  if (!user) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }

  const { password, ...userWithoutPassword } = user;

  res.status(200).json(userWithoutPassword);
});

/**
 * @method PUT
 * @route /api/users
 * @description update logged in user info
 * @access private
 */
export const updateUserInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user;
    const userId = Number(decoded.id);

    const validation = updateUserInfoValidation.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: validation.error.issues[0].message,
      });
      return;
    }

    const userQuery = db.orm.public.User.where({
      id: userId,
    });

    const user = await userQuery.first();

    if (!user) {
      res.status(404).json({
        error: "user not found",
      });
      return;
    }

    const { firstName, lastName } = validation.data;

    type UserUpdateInput = Parameters<typeof userQuery.update>[0];

    const updateData: UserUpdateInput = {
      ...(firstName !== undefined && {
        firstName: firstName as UserUpdateInput["firstName"],
      }),

      ...(lastName !== undefined && {
        lastName: lastName as UserUpdateInput["lastName"],
      }),
    };

    const updatedUser = await userQuery.update(updateData);
    if (!updatedUser) {
      res.status(500).json({
        error: "failed to update user info in database",
      });
      return;
    }
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "user info updated successfully",
      user: userWithoutPassword,
    });
  },
);

/**
 * @method PUT
 * @route /api/users/password/change-password
 * @description change logged in user password
 * @access private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user;
    const userId = Number(decoded.id);

    if (!userId) {
      res.status(403).json({
        message: "user id not provided",
      });
      return;
    }

    const validation = updatePasswordValidation.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: validation.error.issues[0].message,
      });
      return;
    }

    const { oldPassword, newPassword } = validation.data;

    const userQuery = db.orm.public.User.where({
      id: userId,
    });

    const user = await userQuery.first();

    if (!user) {
      res.status(404).json({
        error: "user not found",
      });
      return;
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);

    if (!isMatch) {
      res.status(400).json({
        error: "old password is incorrect",
      });
      return;
    }

    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await userQuery.update({
      password: hashedPassword,
    });

    res.status(200).json({
      message: "password changed successfully",
    });
  },
);

/**
 * @method POST
 * @route /api/users/photo-upload
 * @description upload or replace profile image
 * @access private
 */
export const addProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        error: "image is required",
      });
      return;
    }

    const decoded = (req as any).user;
    const userId = Number(decoded.id);

    const userQuery = db.orm.public.User.where({
      id: userId,
    });

    const user = await userQuery.first();

    if (!user) {
      res.status(404).json({
        error: "user not found",
      });
      return;
    }

    // Upload new image first
    const result: any = await uploadImage(req.file);

    if (!result?.public_id || !result?.secure_url) {
      res.status(500).json({
        error: "failed to upload image to Cloudinary",
      });
      return;
    }

    // Delete old Cloudinary image
    if (user.userImagePublicId) {
      await removeImage(user.userImagePublicId);
    }

    // Update DB
    const updatedUser = await userQuery.update({
      userImageUrl: result.secure_url,
      userImagePublicId: result.public_id,
    });
    if (!updatedUser) {
      res.status(500).json({
        error: "failed to update user image in database",
      });
      return;
    }

    res.status(200).json({
      message: "user image updated successfully",

      userImage: {
        public_id: updatedUser.userImagePublicId
          ? updatedUser.userImagePublicId
          : null,
        url: updatedUser.userImageUrl,
      },
    });
  },
);

/**
 * @method DELETE
 * @route /api/users/:id
 * @description delete user by id
 * @access private - admin or user himself
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      error: "user id is required",
    });
    return;
  }

  const userId = Number(id);

  const userQuery = db.orm.public.User.where({
    id: userId,
  });

  const user = await userQuery.first();

  if (!user) {
    res.status(404).json({
      error: "user not found",
    });
    return;
  }

  if (user.isAdmin) {
    res.status(403).json({
      error: "you can't delete admin account",
    });
    return;
  }

  // Delete profile image from Cloudinary
  if (user.userImagePublicId) {
    await removeImage(user.userImagePublicId);
  }

  // Delete user from PostgreSQL
  await userQuery.delete();

  res.status(200).json({
    message: "user deleted successfully",
  });
});
