import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Temporal } from "temporal-polyfill";
import type { AuthRepository } from "../repo/auth-type-repo.js";
import type {
  AuthCreateInput,
  RegisterInput,
  LoginInput,
} from "../types/auth.js";
import { AppError } from "../../../../utils/AppError.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}
  async register({ email, password, firstName, lastName }: RegisterInput) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.repository.findByEmail(normalizedEmail);
    if (existing?.emailVerified)
      throw new AppError(400, "User already exists", "error");
    if (existing && !existing.emailVerified) {
      // Preserve the current resend branch, which does not persist or send an email.
      crypto.randomBytes(32).toString("hex");
      return { created: false };
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Temporal.Now.instant().add({ hours: 1 });
    await this.repository.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: firstName as AuthCreateInput["firstName"],
      lastName: lastName as AuthCreateInput["lastName"],
      userImageUrl:
        "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png",
      userImagePublicId: null,
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
      emailVerified: true,
    });
    return { created: true };
  }
  async login({ email, password }: LoginInput) {
    const user = await this.repository.findByEmail(email.trim().toLowerCase());
    if (!user) throw new AppError(400, "invalid credentials", "error");
    if (!user.emailVerified)
      throw new AppError(
        400,
        "Please verify your email before logging in",
        "error",
      );
    if (!(await bcryptjs.compare(password, user.password)))
      throw new AppError(400, "invalid credentials", "error");
    const token = jwt.sign(
      { id: user.id, userImageUrl: user.userImageUrl, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "5d" },
    );
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
  async verifyEmail(token: string) {
    const user = await this.repository.findByVerificationToken(
      token,
      Temporal.Now.instant(),
    );
    if (!user) throw new AppError(400, "Invalid or expired token", "error");
    await this.repository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }
}
