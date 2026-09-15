import type { OrderItemRepository } from "../repo/order_items-type-repo.js";
import type {
  AddOrderItemInput,
  EditOrderItemInput,
  OrderItemCreateInput,
  OrderItemUpdateInput,
} from "../types/order_items.js";
import { AppError } from "../../../utils/AppError.js";
export class OrderItemService {
  constructor(private readonly repository: OrderItemRepository) {}
  async getAll() {
    return this.repository.findAll();
  }
  async getById(id: number) {
    const item = await this.repository.findByIdWithRelations(id);
    if (!item) throw new AppError(404, "the order item not found");
    return item;
  }
  async create({ orderId, productId, quantity, price }: AddOrderItemInput) {
    if (!(await this.repository.findProductById(productId)))
      throw new AppError(404, "product not found");
    if (!(await this.repository.findOrderById(orderId)))
      throw new AppError(404, "order not found");
    return this.repository.create({
      orderId,
      productId,
      quantity,
      price: price as unknown as OrderItemCreateInput["price"],
    });
  }
  async update(
    id: number,
    { orderId, productId, quantity, price }: EditOrderItemInput,
  ) {
    if (!(await this.repository.findById(id)))
      throw new AppError(404, "the order item not found");
    if (
      productId !== undefined &&
      !(await this.repository.findProductById(productId))
    )
      throw new AppError(404, "the provided product was not found");
    if (
      orderId !== undefined &&
      !(await this.repository.findOrderById(orderId))
    )
      throw new AppError(404, "the provided order was not found");
    return this.repository.update(id, {
      ...(productId !== undefined && { productId }),
      ...(orderId !== undefined && { orderId }),
      ...(quantity !== undefined && { quantity }),
      ...(price !== undefined && {
        price: price as unknown as OrderItemUpdateInput["price"],
      }),
    });
  }
  async delete(id: number) {
    if (!(await this.repository.findById(id)))
      throw new AppError(404, "the order item not found");
    await this.repository.delete(id);
  }
}
