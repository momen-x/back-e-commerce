import z from "zod";

export const OrderItemInputSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1),
  price: z.coerce.number().positive(),
});

export const OrderSchema = z.object({
  phone: z.string().trim().min(10),

  address: z.string().trim().min(3),

  customerEmail: z.string().trim().email(),

  orderItems: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1),
});

export type OrderType = z.infer<typeof OrderSchema>;
