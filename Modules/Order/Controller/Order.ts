import asyncHandler from "express-async-handler";
import type { OrderService } from "../service/order.js";
import { OrderSchema } from "../Validations/Order.js";

export class OrderController {
  constructor(private readonly service: OrderService) {}
  getOrders = asyncHandler(async (req, res) => {
    res.status(200).json(await this.service.getAll());
  });
  getOrderById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    res
      .status(200)
      .json(
        await this.service.getById(Number(req.params.id), (req as any).user),
      );
  });
  getLastOrder = asyncHandler(async (req, res) => {
    const { id } = (req as any).user;
    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const order = await this.service.getLast(Number(id));
    res
      .status(200)
      .json(order ?? { message: "this user does not have any order yet" });
  });
  getUserOrders = asyncHandler(async (req, res) => {
    res
      .status(200)
      .json(await this.service.getByUser(Number((req as any).user.id)));
  });
  addOrder = asyncHandler(async (req, res) => {
    const validation = OrderSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: validation.error.issues[0].message });
      return;
    }
    res
      .status(201)
      .json(
        await this.service.create(
          Number((req as any).user.id),
          validation.data,
        ),
      );
  });
  deleteOrder = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    await this.service.delete(Number(req.params.id), (req as any).user);
    res.status(200).json({ message: "order deleted successfully" });
  });
}
