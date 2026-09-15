import { db } from "../../../src/prisma/db.js";
import { OrderRepository } from "./order-type-repo.js";
import type { OrderWithItemsInput } from "../types/order.js";
export class PrismaOrderRepository extends OrderRepository {
  async findAll() {
    return await db.orm.public.Order.include("orderItems")
      .include("user")
      .all();
  }
  async findById(id: number) {
    return db.orm.public.Order.where({ id }).first();
  }
  async findByIdWithRelations(id: number) {
    return db.orm.public.Order.where({ id })
      .include("orderItems")
      .include("user")
      .first();
  }
  async findLastByUserId(userId: number) {
    return db.orm.public.Order.where({ userId })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .first();
  }
  async findByUserId(userId: number) {
    return await db.orm.public.Order.where({ userId })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .all();
  }
  async findUserById(id: number) {
    return db.orm.public.User.where({ id }).first();
  }
  async findProductById(id: number) {
    return db.orm.public.Product.where({ id }).first();
  }
  async createWithItems({ order, items }: OrderWithItemsInput) {
    return db.transaction(async (tx) => {
      const created = await tx.orm.public.Order.create(order);
      for (const item of items)
        await tx.orm.public.OrderItem.create({ ...item, orderId: created.id });
      return created;
    });
  }
  async delete(id: number) {
    await db.orm.public.Order.where({ id }).delete();
  }
}
