import asyncHandler from "express-async-handler";
import type { OrderService } from "../service/order.js";
import { OrderSchema } from "../Validations/Order.js";
import { updateOrderDto } from "../Validations/update-order.js";

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
  getCart = asyncHandler(async (req, res) => {
    const { id } = (req as any).user;
    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const cart = await this.service.getCart(Number(id));

    res
      .status(200)
      .json(cart ?? { message: "this user does not have any cart yet" });
  });
  getCartCount = asyncHandler(async (req, res) => {
    const { id } = (req as any).user;
    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const cartCount = await this.service.getCartCount(Number(id));
    res
      .status(200)
      .json(cartCount ?? { message: "this user does not have any cart yet" });
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
  updateOrder = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const validation = updateOrderDto.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: validation.error.issues[0].message });
      return;
    }
    res
      .status(200)
      .json(await this.service.update(Number(req.params.id), validation.data));
  });
  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = (req as any).user;
    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const order = await this.service.orderCompleted(Number(id));
    if (!order) {
      res.status(400).json({ message: "" });
      return;
    }
    res.status(200).json({ message: "order completed", order: order });
  });
}
