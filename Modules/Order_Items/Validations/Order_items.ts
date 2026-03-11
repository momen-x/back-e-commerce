import z from "zod";

export const orderItemsSchema = z.object({
  product: z.string().min(1, { message: "the product id is required" }),
  quantity: z.number().min(1, { message: "the quantity is required" }),
  price: z.number().min(1, { message: "the price is required" }),
});

export const updateOrderItemsSchema = z.object({
  product: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
});
