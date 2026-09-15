import type { db } from "../../../src/prisma/db.js";
export type ProductCreateInput = Parameters<
  typeof db.orm.public.Product.create
>[0];
// Create and update relation callbacks differ; updates here use scalar fields.
export type ProductUpdateInput = Partial<
  Omit<ProductCreateInput, "category" | "orderItems">
>;

import type { z } from "zod";
import type {
  addProductSchema,
  updateProductSchema,
} from "../Validations/Product.js";
export type AddProductInput = z.infer<typeof addProductSchema>;
export type EditProductInput = z.infer<typeof updateProductSchema>;
export type ProductPage = { page: number; limit: number };
