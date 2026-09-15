import type { OrderRepository } from "../repo/order-type-repo.js";
import type {
  AddOrderInput,
  OrderActor,
  OrderCreateInput,
} from "../types/order.js";
import { AppError } from "../../../utils/AppError.js";

export class OrderService {
  constructor(private readonly repository: OrderRepository) {}
  async getAll() {
    return this.repository.findAll();
  }
  async getById(id: number, actor: OrderActor) {
    const order = await this.repository.findByIdWithRelations(id);
    if (!order) throw new AppError(404, "order not found");
    if (order.userId !== Number(actor.id) && !actor.isAdmin)
      throw new AppError(403, "you are not authorized to access this order");
    return order;
  }
  async getLast(userId: number) {
    return this.repository.findLastByUserId(userId);
  }
  async getByUser(userId: number) {
    return this.repository.findByUserId(userId);
  }
  async create(
    userId: number,
    { address, customerEmail, phone, orderItems }: AddOrderInput,
  ) {
    if (!(await this.repository.findUserById(userId)))
      throw new AppError(404, "user not found");
    const products = await Promise.all(
      orderItems.map(async (item) => ({
        ...item,
        product: await this.repository.findProductById(item.productId),
      })),
    );
    const missing = products.find((item) => !item.product);
    if (missing)
      throw new AppError(404, `product ${missing.productId} not found`);
    const totalPrice = products.reduce(
      (total, item) => total + Number(item.product!.price) * item.quantity,
      0,
    );
    return this.repository.createWithItems({
      order: {
        userId,
        address,
        customerEmail,
        phone: phone as OrderCreateInput["phone"],
        totalPrice: totalPrice as unknown as OrderCreateInput["totalPrice"],
      },
      items: products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
      })),
    });
  }
  async delete(id: number, actor: OrderActor) {
    const order = await this.repository.findById(id);
    if (!order) throw new AppError(404, "order not found");
    if (order.userId !== Number(actor.id) && !actor.isAdmin)
      throw new AppError(403, "you are not authorized to delete this order");
    await this.repository.delete(id);
  }
}
