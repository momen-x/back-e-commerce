import type { db } from "../../../src/prisma/db.js";

export type OrderCreateInput = Parameters<typeof db.orm.public.Order.create>[0];

type OrderWhereCollection = ReturnType<typeof db.orm.public.Order.where>;
export type OrderUpdateInput = Parameters<OrderWhereCollection["update"]>[0];

export type { OrderType as AddOrderInput } from "../Validations/Order.js";
export type OrderActor = { id: number | string; isAdmin: boolean };
export type OrderWithItemsInput = {
  order: Omit<OrderCreateInput, "orderItems" | "user">;
};
