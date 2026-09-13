import { db } from "../../../src/prisma/db";
import { LoginValidation } from "../Auth/Validations/LoginValidation";
import {
  UpdatePasswordType,
  ResetPasswordType,
} from "../Auth/Validations/PasswordValidation";
import { RegisterValidation } from "../Auth/Validations/RegisterValidation";
import { User } from "../entities/user";
import { UpdateUserInfoValidation } from "../Validations/UpdateUserInfo";
import { UserPrisma } from "./user";

export const resUserPrisma: UserPrisma = {
  findAll: async function (): Promise<User[]> {
    return await db.orm.public.User.all();
  },
  findById: async function (id: number): Promise<User | null> {
    return await db.orm.public.User.where({ id }).first();
  },
  register: function (data: RegisterValidation): Promise<User> {
    throw new Error("Function not implemented.");
  },
  login: function (data: LoginValidation): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  updateUserInfo: function (
    id: string,
    data: UpdateUserInfoValidation,
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  updatePassword: function (
    id: string,
    data: UpdatePasswordType,
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  findByEmail: function (email: string): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  findByEmailVerificationToken: function (token: string): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  findByPasswordResetToken: function (token: string): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  updateEmailVerificationToken: function (
    id: number,
    token: string,
    expires: Date,
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  updatePasswordResetToken: function (
    id: number,
    token: string,
    expires: Date,
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
  resetPassword: function (
    id: number,
    data: ResetPasswordType,
  ): Promise<User | null> {
    throw new Error("Function not implemented.");
  },
};
