import type { User } from "../../entities/user.js";
import type { AuthCreateInput, AuthUpdateInput } from "../types/auth.js";
import type { Temporal } from "temporal-polyfill";
export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByVerificationToken(
    token: string,
    now: Temporal.Instant,
  ): Promise<User | null>;
  abstract create(data: AuthCreateInput): Promise<User>;
  abstract update(id: number, data: AuthUpdateInput): Promise<User | null>;
}
