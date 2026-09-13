import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OrderSchema } from "../Validations/Order.js";
import dotenv from "dotenv";
import { db } from "../../../src/prisma/db.js";

dotenv.config();

/**
 *@method GET
 *@route /api/orders
 *@description get all orders
 *@access private just the admin can get all orders
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await db.orm.public.Order.include("orderItems")
    .include("user")
    .all();

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
      res.status(400).json({
        message: "id is required",
      });
      return;
    }

    const decoded = (req as any).user;

    const order = await db.orm.public.Order.where({
      id: Number(id),
    })
      .include("orderItems")
      .include("user")
      .first();

    if (!order) {
      res.status(404).json({
        message: "order not found",
      });
      return;
    }

    if (order.userId !== Number(decoded.id) && !decoded.isAdmin) {
      res.status(403).json({
        message: "you are not authorized to access this order",
      });
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
export const getLastOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user;
    const id = decoded.id;

    if (!id) {
      res.status(400).json({ message: "id is required" });
      return;
    }

    const order = await db.orm.public.Order.where({
      userId: Number(id),
    })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .first();

    if (!order) {
      res.status(200).json({
        message: "this user does not have any order yet",
      });
      return;
    }

    res.status(200).json(order);
  },
);
/**
 * @Method GET
 * @route /api/orders/user-orders
 * @description get the orders that the user paid
 * @access private the user himself can see own orders
 */
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const decoded = (req as any).user;
    const userId = Number(decoded.id);

    const orders = await db.orm.public.Order.where({
      userId,
    })
      .include("orderItems")
      .include("user")
      .orderBy((order) => order.createdAt.desc())
      .all();

    res.status(200).json(orders);
  },
);

/**
 * @method POST
 * @route /api/orders
 * @description add new order
 * @access private just the logged admin can add new order
 */
export const addOrder = asyncHandler(async (req: Request, res: Response) => {
  const validation = OrderSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: validation.error.issues[0].message,
    });
    return;
  }

  const decoded = (req as any).user;
  const userId = Number(decoded.id);

  const { address, customerEmail, phone, orderItems } = validation.data;

  // 1. Make sure user exists
  const user = await db.orm.public.User.where({
    id: userId,
  }).first();

  if (!user) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }

  // 2. Load products from DB
  const products = await Promise.all(
    orderItems.map(async (item) => {
      const product = await db.orm.public.Product.where({
        id: item.productId,
      }).first();

      return {
        ...item,
        product,
      };
    }),
  );

  const missingProduct = products.find((item) => !item.product);

  if (missingProduct) {
    res.status(404).json({
      message: `product ${missingProduct.productId} not found`,
    });
    return;
  }

  type OrderCreateInput = Parameters<typeof db.orm.public.Order.create>[0];

  type OrderItemCreateInput = Parameters<
    typeof db.orm.public.OrderItem.create
  >[0];

  // 3. Calculate total from DB prices
  const totalPrice = products.reduce((total, item) => {
    const price = Number(item.product!.price);

    return total + price * item.quantity;
  }, 0);

  // 4. Create order + order items together
  const order = await db.orm.public.Order.create({
    userId,

    address,

    customerEmail,

    phone: phone as OrderCreateInput["phone"],

    totalPrice: totalPrice as unknown as OrderCreateInput["totalPrice"],

    orderItems: (items) =>
      items.create(
        products.map((item) => ({
          productId: item.productId,

          quantity: item.quantity,

          price: item.product!
            .price as unknown as OrderItemCreateInput["price"],
        })),
      ),
  });

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
    res.status(400).json({
      message: "id is required",
    });
    return;
  }

  const decoded = (req as any).user;

  const orderQuery = db.orm.public.Order.where({
    id: Number(id),
  });

  const order = await orderQuery.first();

  if (!order) {
    res.status(404).json({
      message: "order not found",
    });
    return;
  }

  if (order.userId !== Number(decoded.id) && !decoded.isAdmin) {
    res.status(403).json({
      message: "you are not authorized to delete this order",
    });
    return;
  }

  await orderQuery.delete();

  res.status(200).json({
    message: "order deleted successfully",
  });
});
