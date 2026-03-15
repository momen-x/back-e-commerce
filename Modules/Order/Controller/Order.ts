import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Order } from "../Models/Order";
import { OrderSchema } from "../Validations/Order";
import { OrderItem } from "../../Order_Items/Models/Order_Item";
import dotenv from "dotenv";

dotenv.config();

/**
 *@method GET
 *@route /api/orders
 *@description get all orders
 *@access private just the admin can get all orders
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find().populate(["orderItemsId", "user"]);
  res.status(200).json(orders);
});
/**
 *@method GET
 *@route /api/orders/:id
 *@description get  order by id
 *@access private just the admin and the user himself can get all orders
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: "order not found" });
      return;
    }
    res.status(200).json(order);
  },
);

/**
 * @method GET
 * @route /api/orders/last-order
 * @description check if the last order paid or not
 * @access private the user himself
 */
export const getLastOrder = asyncHandler(async (req, res) => {
  const decoded = (req as any).user; // set by VerifyToken middleware
  const id = decoded.id;
  if (!id) {
    res.status(400).json({ message: "id is required" });
    return;
  }
  const order = await Order.findOne({ user: id })
    .sort({ createdAt: -1 })
    .populate({
      path: "orderItemsId",
      populate: {
        path: "product", // ← populate product inside each order item
        model: "Product",
      },
    })
    .populate("user");
  if (!order) {
    res.status(200).json({ message: "this user does not have any order yet" });
    return;
  }
  res.status(200).json(order);
  return;
});

/**
 * @Method GET
 * @route /api/orders/user-orders
 * @description get the orders that the user paid
 * @access private the user himself can see own orders
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  const { id } = (req as any).user;
  if (!id) {
    res.status(400).json({ message: "id is required" });
    return;
  }
  const orders = await Order.find({ user: id, isPaid: true }).populate({
    path: "orderItemsId",
  });
  res.status(200).json(orders);
});

/**
 * @method POST
 * @route /api/orders
 * @description add new order
 * @access private just the logged admin can add new order
 */
export const addOrder = asyncHandler(async (req: Request, res: Response) => {
  const validation = OrderSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ message: validation.error.issues[0].message });
    return;
  }
  const { orderItemsId } = validation.data;

  const foundOrderItems = await Promise.all(
    orderItemsId.map(async (itemId) => await OrderItem.findById(itemId)),
  );
  // If any item in the array is null, it means it wasn't found
  if (foundOrderItems.includes(null)) {
    res.status(404).json({ message: "One or more order items not found" });
    return;
  }

  const order = await Order.create(validation.data);
  res.status(201).json(order);
});

/**
 * @method DELETE
 * @route /api/order/:id
 * @description delete order by order id
 * @access private just admin and user himself can do that
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "id is required" });
    return;
  }
  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ message: "order not found" });
    return;
  }
  await OrderItem.deleteMany({ _id: { $in: order.orderItemsId } });
  await order.deleteOne();
  res.status(200).json({ message: "order deleted" });
});
