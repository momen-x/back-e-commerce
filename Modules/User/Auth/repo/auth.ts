import { db } from "../../../../src/prisma/db.js";
import { AuthRepository } from "./auth-type-repo.js";
import type { AuthCreateInput, AuthUpdateInput } from "../types/auth.js";
import type { Temporal } from "temporal-polyfill";
export class PrismaAuthRepository extends AuthRepository {
  async findByEmail(email: string) {
    return db.orm.public.User.where({ email }).first();
  }
  async findByVerificationToken(token: string, now: Temporal.Instant) {
    return db.orm.public.User.where((user) =>
      user.emailVerificationToken.eq(token),
    )
      .where((user) => user.emailVerificationExpires.gt(now))
      .first();
  }
  async create(data: AuthCreateInput) {
    return db.orm.public.User.create(data);
  }
  async update(id: number, data: AuthUpdateInput) {
    return db.orm.public.User.where({ id }).update(data);
  }
}
