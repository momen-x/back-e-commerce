import type { Order } from "../entities/order.js";
import type { OrderWithItemsInput } from "../types/order.js";
import type { Product } from "../../Products/entities/product.js";
import type { User } from "../../User/entities/user.js";
import type { OrderItem } from "../../Order_Items/entities/order_items.js";
export type OrderWithRelations = Order & {
  orderItems: OrderItem[];
  user: User | null;
};
export abstract class OrderRepository {
  abstract findAll(): Promise<OrderWithRelations[]>;
  abstract findById(id: number): Promise<Order | null>;
  abstract findByIdWithRelations(
    id: number,
  ): Promise<OrderWithRelations | null>;
  abstract findLastByUserId(userId: number): Promise<OrderWithRelations | null>;
  abstract findByUserId(userId: number): Promise<OrderWithRelations[]>;
  abstract findUserById(id: number): Promise<User | null>;
  abstract findProductById(id: number): Promise<Product | null>;
  abstract createWithItems(data: OrderWithItemsInput): Promise<Order>;
  abstract delete(id: number): Promise<void>;
}
