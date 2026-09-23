import bcryptjs from "bcryptjs";
import type { UserRepository } from "../repo/user.js";
import type { UserUpdateInput } from "../types/user.js";
import type { UpdateUserInfoValidation } from "../Validations/UpdateUserInfo.js";
import type { UpdatePasswordType } from "../Auth/Validations/PasswordValidation.js";
import type { ImageInput } from "../../../utils/image.js";
import { uploadImage, removeImage } from "../../../utils/cloudinary.js";
import { AppError } from "../../../utils/AppError.js";
import { defaultImage } from "../utils/constance.js";

export class UserService {
  constructor(private readonly repository: UserRepository) {}
  private async requireUser(id: number, shape: "error" | "message" = "error") {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError(404, "user not found", shape);
    return user;
  }
  async getAll() {
    const users = await this.repository.findAll();
    return {
      count: users.length,
      users: users.map(({ password, ...user }) => user),
    };
  }
  async getById(id: number, shape: "error" | "message" = "error") {
    const { password, ...user } = await this.requireUser(id, shape);
    return user;
  }
  async update(id: number, { firstName, lastName }: UpdateUserInfoValidation) {
    await this.requireUser(id);
    const updated = await this.repository.update(id, {
      ...(firstName !== undefined && {
        firstName: firstName as UserUpdateInput["firstName"],
      }),
      ...(lastName !== undefined && {
        lastName: lastName as UserUpdateInput["lastName"],
      }),
    });
    if (!updated)
      throw new AppError(
        500,
        "failed to update user info in database",
        "error",
      );
    const { password, ...user } = updated;
    return user;
  }
  async changePassword(
    id: number,
    { oldPassword, newPassword }: UpdatePasswordType,
  ) {
    const user = await this.requireUser(id);
    if (!(await bcryptjs.compare(oldPassword, user.password)))
      throw new AppError(400, "old password is incorrect", "error");
    const salt = await bcryptjs.genSalt(10);
    const password = await bcryptjs.hash(newPassword, salt);
    await this.repository.update(id, { password });
  }
  async addProfileImage(id: number, file: ImageInput) {
    const user = await this.requireUser(id);
    const result = await uploadImage(file);
    if (!result?.public_id || !result?.secure_url)
      throw new AppError(500, "failed to upload image to Cloudinary", "error");
    if (user.userImagePublicId) await removeImage(user.userImagePublicId);
    const updated = await this.repository.update(id, {
      userImageUrl: result.secure_url,
      userImagePublicId: result.public_id,
    });
    if (!updated)
      throw new AppError(
        500,
        "failed to update user image in database",
        "error",
      );
    return {
      public_id: updated.userImagePublicId || null,
      url: updated.userImageUrl,
    };
  }
  async deleteProfileImage(id: number) {
    const user = await this.requireUser(id);
    if (user.userImageUrl === defaultImage) return;
    if (user.userImagePublicId) await removeImage(user.userImagePublicId);
    await this.repository.update(id, {
      userImageUrl: defaultImage,
      userImagePublicId: null,
    });
  }
  async delete(id: number) {
    const user = await this.requireUser(id);
    if (user.isAdmin)
      throw new AppError(403, "you can't delete admin account", "error");
    if (user.userImagePublicId) await removeImage(user.userImagePublicId);
    await this.repository.delete(id);
  }
}
