import type { OrderItem } from "../entities/order_items.js";
import type { Product } from "../../Products/entities/product.js";
import type { Order } from "../../Order/entities/order.js";
import type {
  OrderItemCreateInput,
  OrderItemUpdateInput,
} from "../types/order_items.js";
export type OrderItemWithRelations = OrderItem & {
  product: Product | null;
  order: Order | null;
};
export abstract class OrderItemRepository {
  abstract findAll(): Promise<OrderItemWithRelations[]>;
  abstract findById(id: number): Promise<OrderItem | null>;
  abstract findByIdWithRelations(
    id: number,
  ): Promise<OrderItemWithRelations | null>;
  abstract findProductById(id: number): Promise<Product | null>;
  abstract findOrderById(id: number): Promise<Order | null>;
  abstract findByOrderAndProduct(
    orderId: number,
    productId: number,
  ): Promise<OrderItem | null>;
  abstract create(data: OrderItemCreateInput): Promise<OrderItem>;
  abstract update(
    id: number,
    data: OrderItemUpdateInput,
  ): Promise<OrderItem | null>;
  abstract delete(id: number): Promise<void>;
}
