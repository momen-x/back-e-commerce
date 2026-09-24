import { db } from "../../../src/prisma/db.js";
import { OrderRepository, OrderWithRelations } from "./order-type-repo.js";
import type { OrderWithItemsInput } from "../types/order.js";
import { Order } from "../entities/order.js";
import { Numeric } from "@prisma/orm-postgres/target/codec-types";
import { updateOrderData } from "../Validations/update-order.js";
export class PrismaOrderRepository extends OrderRepository {
  async update(id: number, data: updateOrderData): Promise<Order> {
    type PrismaOrderUpdateData = Parameters<
      ReturnType<typeof db.orm.public.Order.where>["update"]
    >[0];
    const order = await db.orm.public.Order.where({ id }).update(
      data as unknown as PrismaOrderUpdateData,
    );
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }
  async updateTotalPrice(id: number, totalPrice: number): Promise<Order> {
    const order = await db.orm.public.Order.where({ id }).update({
      totalPrice: totalPrice.toFixed(2) as Numeric<10, 2>,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
  async updateOrderStatus(id: number): Promise<Order> {
    const order = await db.orm.public.Order.where({ id }).update({
      status: "delivered",
      isPaid: true,
    });
    if (!order) throw new Error("Order not found");
    return order;
  }
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
  async findCartByUserId(userId: number): Promise<OrderWithRelations | null> {
    return db.orm.public.Order.where({
      userId,
      isPaid: false,
      status: "pending",
    })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .first();
  }

  async findByUserId(userId: number) {
    return await db.orm.public.Order.where({ userId, status: "delivered" })
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
  async create({ order }: OrderWithItemsInput) {
    const created = await db.orm.public.Order.create(order);
    const theOrder = await db.orm.public.Order.where({
      id: created.id,
    })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .first();
    if (!theOrder) {
      throw new Error("Order not found");
    }
    return theOrder;
  }
  async delete(id: number) {
    await db.orm.public.Order.where({ id }).delete();
  }
}
