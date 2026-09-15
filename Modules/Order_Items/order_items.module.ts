import { PrismaOrderItemRepository } from "./repo/order_items.js";
import { OrderItemService } from "./service/order_items.js";
import { OrderItemController } from "./Controller/order_items.js";

const repository = new PrismaOrderItemRepository();
const service = new OrderItemService(repository);
export const orderItemController = new OrderItemController(service);
