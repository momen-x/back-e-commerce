import asyncHandler from "express-async-handler";
import type { UserService } from "../service/user.js";
import { updateUserInfoValidation } from "../Validations/UpdateUserInfo.js";
import { updatePasswordValidation } from "../Auth/Validations/PasswordValidation.js";

export class UserController {
  constructor(private readonly service: UserService) {}
  getAllUsers = asyncHandler(async (req, res) => {
    res.status(200).json(await this.service.getAll());
  });
  getUserById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ error: "user id is required" });
      return;
    }
    res.status(200).json(await this.service.getById(Number(req.params.id)));
  });
  getMe = asyncHandler(async (req, res) => {
    res
      .status(200)
      .json(
        await this.service.getById(Number((req as any).user.id), "message"),
      );
  });
  updateUserInfo = asyncHandler(async (req, res) => {
    const validation = updateUserInfoValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const user = await this.service.update(
      Number((req as any).user.id),
      validation.data,
    );
    res.status(200).json({ message: "user info updated successfully", user });
  });
  changePassword = asyncHandler(async (req, res) => {
    const id = Number((req as any).user.id);
    if (!id) {
      res.status(403).json({ message: "user id not provided" });
      return;
    }
    const validation = updatePasswordValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    await this.service.changePassword(id, validation.data);
    res.status(200).json({ message: "password changed successfully" });
  });
  addProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "image is required" });
      return;
    }
    const userImage = await this.service.addProfileImage(
      Number((req as any).user.id),
      req.file,
    );
    res
      .status(200)
      .json({ message: "user image updated successfully", userImage });
  });
  deleteProfileImage = asyncHandler(async (req, res) => {
    await this.service.deleteProfileImage(Number((req as any).user.id));
    res.status(200).json({ message: "user image deleted successfully" });
  });
  deleteUser = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ error: "user id is required" });
      return;
    }
    await this.service.delete(Number(req.params.id));
    res.status(200).json({ message: "user deleted successfully" });
  });
}
