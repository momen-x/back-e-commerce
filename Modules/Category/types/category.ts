import type { db } from "../../../src/prisma/db.js";

export type CategoryCreateInput = Parameters<
  typeof db.orm.public.Category.create
>[0];
export type CategoryUpdateInput = Partial<Omit<CategoryCreateInput, "products">>;
