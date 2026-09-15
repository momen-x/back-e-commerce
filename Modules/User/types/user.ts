import type { db } from "../../../src/prisma/db.js";
export type UserCreateInput = Parameters<typeof db.orm.public.User.create>[0];
export type UserUpdateInput = Partial<Omit<UserCreateInput, "orders">>;
