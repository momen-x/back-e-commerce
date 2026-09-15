import { PrismaOrderRepository } from "./repo/order.js";
import { OrderService } from "./service/order.js";
import { OrderController } from "./Controller/Order.js";

const repository = new PrismaOrderRepository();
const service = new OrderService(repository);
export const orderController = new OrderController(service);
