import type { db } from "../../../src/prisma/db.js";
export type Order = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.Order.first>>
>;
