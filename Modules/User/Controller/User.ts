import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import asyncHandler from "express-async-handler";
import { updateUserInfoValidation } from "../Validations/UpdateUserInfo";
import { User } from "../Models/User";
import dotenv from "dotenv";
import { uploadImage, removeImage } from "../../../utils/cloudinary";
import { updatePasswordValidation } from "../Auth/Validations/PasswordValidation";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

/**
 * route get /api/users
 * desc get all users (admin only)
 * access private (admin only)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.status(200).json({ count: users.length, users });
  return;
});

/**
 * route get /api/users/:id
 * desc get user by id
 * access private (admin and user himself can access this route)
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.status(200).json(user);
  return;
});

/**
 * @method GET
 * @route /api/users/me
 * @description return user data
 * @access private just by user himself
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const decoded = (req as any).user; // set by VerifyToken middleware

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json(user);
});

/*
 *route PUT /api/users
 *desc update user info
 *access private (user can update only his info and admin can update any user info)
 */
export const updateUserInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user; // set by VerifyToken middleware
    const id = decoded.id;
    const validation = updateUserInfoValidation.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { firstName, lastName, userImage } = validation.data;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.userImage = userImage || user.userImage;
    await user.save();
    res.status(200).json({ message: "user info updated successfully" });
    return;
  },
);

/**
 *@route /api/users/password/change-password
 *@Method PUT
 *@description change the user password
 *@access private the user logged in
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user; // set by VerifyToken middleware
    const id = decoded.id;
    if (!id) {
      res.status(403).json("the id not provided");
      return;
    }

    const validation = updatePasswordValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const { oldPassword, newPassword } = validation.data;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "old password is incorrect" });
      return;
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "password changed successfully" });
    return;
  },
);

/**
 *@route POST /api/users/photo-upload
 *@desc add new profile image
 @access Private (user can update only his image)
 */
export const addProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    //1- VALIDATION
    if (!req.file) {
      res.status(400).json({ error: "image is required" });
      return;
    }
    //2- get the path to the image
    const imagePath = path.join(
      __dirname,
      "../../../images",
      req.file.filename,
    );
    //3-upload to cloudinary
    const result: any = await uploadImage(imagePath);
    // console.log("the result is : ",result);
    const user = await User.findById((req as any).user.id);
    if (!user) {
      res.status(404).json({ error: "user not found" });
      return;
    }

    //4-delete the old user image if exist
    const userImagePublicId = user.userImage.public_id;

    if (userImagePublicId !== null) {
      await removeImage(userImagePublicId);
    }
    //5-change the user image in the db
    user.userImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await user.save();

    //6-sent response to client
    res.status(200).json({
      message: "user image updated successfully",
      userImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    //-7 delete  image from the server
    fs.unlinkSync(imagePath);
    return;
  },
);

/**
 * @route DELETE /api/users/:id
 * @desc delete user by id
 * @access private (admin and user himself can access this route , the Admin account just by db manager can deleted)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({ error: "user id is required" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  if (user.isAdmin) {
    res.status(403).json({ error: "you can't delete admin account" });
    return;
  }
  if (user.userImage.public_id) {
    await removeImage(user.userImage.public_id);
  }
  await user.deleteOne();
  res.status(200).json({ message: "user deleted successfully" });
  return;
});
