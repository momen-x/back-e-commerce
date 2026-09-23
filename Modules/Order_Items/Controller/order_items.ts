import asyncHandler from "express-async-handler";
import type { OrderItemService } from "../service/order_items.js";
import {
  orderItemsSchema,
} from "../Validations/Order_items.js";
export class OrderItemController {
  constructor(private readonly service: OrderItemService) {}
  getAllOrderItems = asyncHandler(async (req, res) => {
    res.status(200).json(await this.service.getAll());
  });
  getOrderItemsById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "the id is required" });
      return;
    }
    res.status(200).json(await this.service.getById(Number(req.params.id)));
  });
  addNewOrderItems = asyncHandler(async (req, res) => {
    const validation = orderItemsSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    const userId= Number((req as any).user.id);
    res.status(201).json(await this.service.create(userId, validation.data));
  });

  deleteOrderItem = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "the id is required" });
      return;
    }
    await this.service.delete(Number(req.params.id));
    res.status(200).json({ message: "the order item deleted successfully" });
  });
  getOrderItemsByOrderId = asyncHandler(async (req, res) => {
    if (!req.params.orderId) {
      res.status(400).json({ message: "the order id is required" });
      return;
    }
    res.status(200).json(await this.service.getByOrderId(Number(req.params.orderId)));
  });
}
