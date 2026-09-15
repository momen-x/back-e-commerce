import { db } from "../../../src/prisma/db.js";
import { UserRepository } from "./user.js";
import type { UserCreateInput, UserUpdateInput } from "../types/user.js";
export class PrismaUserRepository extends UserRepository {
  async findAll() {
    return await db.orm.public.User.all();
  }
  async findById(id: number) {
    return db.orm.public.User.where({ id }).first();
  }
  async findByEmail(email: string) {
    return db.orm.public.User.where({ email }).first();
  }
  async create(data: UserCreateInput) {
    return db.orm.public.User.create(data);
  }
  async update(id: number, data: UserUpdateInput) {
    return db.orm.public.User.where({ id }).update(data);
  }
  async delete(id: number) {
    await db.orm.public.User.where({ id }).delete();
  }
}
