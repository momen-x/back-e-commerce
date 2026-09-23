import { PrismaOrderItemRepository } from "./repo/order_items.js";
import { OrderItemService } from "./service/order_items.js";
import { OrderItemController } from "./Controller/order_items.js";
import { PrismaOrderRepository } from "../Order/repo/order.js";

const repository = new PrismaOrderItemRepository();
const orderRepository = new PrismaOrderRepository();

const service = new OrderItemService(repository, orderRepository);
export const orderItemController = new OrderItemController(service);
