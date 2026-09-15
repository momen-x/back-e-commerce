import type { db } from "../../../src/prisma/db.js";
export type OrderItemCreateInput = Parameters<
  typeof db.orm.public.OrderItem.create
>[0];
export type OrderItemUpdateInput = Partial<
  Omit<OrderItemCreateInput, "product" | "order">
>;

import type { z } from "zod";
import type {
  orderItemsSchema,
  updateOrderItemsSchema,
} from "../Validations/Order_items.js";
export type AddOrderItemInput = z.infer<typeof orderItemsSchema>;
export type EditOrderItemInput = z.infer<typeof updateOrderItemsSchema>;
