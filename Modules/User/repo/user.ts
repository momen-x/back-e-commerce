import { LoginValidation } from "../Auth/Validations/LoginValidation";
import { ResetPasswordType, UpdatePasswordType } from "../Auth/Validations/PasswordValidation";
import { RegisterValidation } from "../Auth/Validations/RegisterValidation";
import { User } from "../entities/user";
import { UpdateUserInfoValidation } from "../Validations/UpdateUserInfo";

export interface UserPrisma {
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    register(data: RegisterValidation): Promise<User>;
    login(data: LoginValidation): Promise<User | null>;
    updateUserInfo(id: string, data: UpdateUserInfoValidation): Promise<User | null>;
    updatePassword(id: string, data: UpdatePasswordType): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailVerificationToken(token: string): Promise<User | null>;
    findByPasswordResetToken(token: string): Promise<User | null>;
    updateEmailVerificationToken(id: number, token: string, expires: Date): Promise<User | null>;
    updatePasswordResetToken(id: number, token: string, expires: Date): Promise<User | null>;
    resetPassword(id: number, data: ResetPasswordType): Promise<User | null>;

}