import type { db } from "../../../src/prisma/db.js";
export type OrderCreateInput = Parameters<typeof db.orm.public.Order.create>[0];
export type OrderUpdateInput = Partial<
  Omit<OrderCreateInput, "user" | "orderItems">
>;

export type { OrderType as AddOrderInput } from "../Validations/Order.js";
export type OrderActor = { id: number | string; isAdmin: boolean };
export type OrderWithItemsInput = {
  order: Omit<OrderCreateInput, "orderItems" | "user">;
  items: {
    productId: number;
    quantity: number;
    price: OrderCreateInput["totalPrice"];
  }[];
};
