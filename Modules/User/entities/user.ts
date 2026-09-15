import type { db } from "../../../src/prisma/db.js";
export type User = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.User.first>>
>;
