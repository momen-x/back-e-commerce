import type { db } from "../../../src/prisma/db.js";
export type OrderItem = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.OrderItem.first>>
>;
