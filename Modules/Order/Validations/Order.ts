import z from "zod";

export const OrderSchema = z.object({
  user: z.string(),
  orderItemsId: z.array(z.string()),
  phone: z.string(),
  address: z.string(),
  customerEmail: z.string(),
  totalPrice: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});


export type OrderType = z.infer<typeof OrderSchema>;