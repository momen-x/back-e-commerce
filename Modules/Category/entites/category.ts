import type { db } from "../../../src/prisma/db.js";

export type Category = Parameters<typeof db.orm.public.Category.create>[0];

export type { CategoryUpdateInput } from "../types/category.js";
