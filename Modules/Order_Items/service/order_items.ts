import type { OrderItemRepository } from "../repo/order_items-type-repo.js";
import type {
  AddOrderItemInput,
  OrderItemCreateInput,
} from "../types/order_items.js";
import { AppError } from "../../../utils/AppError.js";
import { OrderRepository } from "../../Order/repo/order-type-repo.js";
import { OrderWithItemsInput } from "../../Order/types/order.js";
export class OrderItemService {
  constructor(
    private readonly repository: OrderItemRepository,
    private readonly orderRepository: OrderRepository,
  ) {}
  async getAll() {
    return this.repository.findAll();
  }
  async getById(id: number) {
    const item = await this.repository.findByIdWithRelations(id);
    if (!item) throw new AppError(404, "the order item not found");
    return item;
  }
  async getByOrderId(orderId: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new AppError(404, "order not found");
    return this.repository.findOrderById(orderId);
  }
  async create(userId: number, { productId, quantity }: AddOrderItemInput) {
    const product = await this.repository.findProductById(productId);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    let order = await this.orderRepository.findCartByUserId(userId);

    if (!order) {
      type OrderInput = OrderWithItemsInput["order"];

      const data: OrderWithItemsInput = {
        order: {
          userId,
          address: "",
          customerEmail: "",

          phone: "" as OrderInput["phone"],

          totalPrice: 0 as unknown as OrderInput["totalPrice"],
        },
      };

      order = await this.orderRepository.create(data);
    }


    const orderId = order.id;

    const existingItem = await this.repository.findByOrderAndProduct(
      orderId,
      productId,
    );

    const productPrice = Number(product.price);

    const currentTotal = Number(order.totalPrice);

    const addedPrice = productPrice * quantity;

    const newTotalPrice = currentTotal + addedPrice;

    // Product already exists in cart
    if (existingItem) {
      const updatedItem = await this.repository.update(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });

      await this.orderRepository.updateTotalPrice(orderId, newTotalPrice);

      return updatedItem;
    }

    // New product in cart if not the product not exist in the cart
    const createdItem = await this.repository.create({
      orderId,
      productId,
      quantity,

      price: product.price as unknown as OrderItemCreateInput["price"],
    });

    await this.orderRepository.updateTotalPrice(orderId, newTotalPrice);

    return createdItem;
  }

  async delete(id: number) {
    if (!(await this.repository.findById(id)))
      throw new AppError(404, "the order item not found");
    await this.repository.delete(id);
  }
}
