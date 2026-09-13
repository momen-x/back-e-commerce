import z from "zod";


export const orderItemsSchema = z.object({
  orderId: z.coerce.number().int().positive(),

  productId: z.coerce.number().int().positive(),

  quantity: z.coerce.number().int().min(1),

  price: z.coerce.number().positive(),
});

export const updateOrderItemsSchema = orderItemsSchema.partial();


