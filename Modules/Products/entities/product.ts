import type { db } from "../../../src/prisma/db.js";
export type Product = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.Product.first>>
>;
