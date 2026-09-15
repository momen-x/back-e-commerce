import { db } from "../../../src/prisma/db.js";
import { OrderItemRepository } from "./order_items-type-repo.js";
import type {
  OrderItemCreateInput,
  OrderItemUpdateInput,
} from "../types/order_items.js";
export class PrismaOrderItemRepository extends OrderItemRepository {
  async findAll() {
    return await db.orm.public.OrderItem.include("product")
      .include("order")
      .all();
  }
  async findById(id: number) {
    return db.orm.public.OrderItem.where({ id }).first();
  }
  async findByIdWithRelations(id: number) {
    return db.orm.public.OrderItem.where({ id })
      .include("product")
      .include("order")
      .first();
  }
  async findProductById(id: number) {
    return db.orm.public.Product.where({ id }).first();
  }
  async findOrderById(id: number) {
    return db.orm.public.Order.where({ id }).first();
  }
  async create(data: OrderItemCreateInput) {
    return db.orm.public.OrderItem.create(data);
  }
  async update(id: number, data: OrderItemUpdateInput) {
    return db.orm.public.OrderItem.where({ id }).update(data);
  }
  async delete(id: number) {
    await db.orm.public.OrderItem.where({ id }).delete();
  }
}
