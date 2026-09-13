import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import {
  orderItemsSchema,
  updateOrderItemsSchema,
} from "../Validations/Order_items.js";

import { db } from "../../../src/prisma/db.js";

/**
 * @method GET
 * @route /api/order-items
 * @description get all order items
 * @access private - admin only
 */
export const getAllOrderItems = asyncHandler(
  async (req: Request, res: Response) => {
    const orderItems = await db.orm.public.OrderItem.include("product")
      .include("order")
      .all();

    res.status(200).json(orderItems);
  },
);

/**
 * @method GET
 * @route /api/order-items/:id
 * @description get order item by id
 * @access private - admin or owner
 */
export const getOrderItemsById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "the id is required",
      });
      return;
    }

    const orderItem = await db.orm.public.OrderItem.where({
      id: Number(id),
    })
      .include("product")
      .include("order")
      .first();

    if (!orderItem) {
      res.status(404).json({
        message: "the order item not found",
      });
      return;
    }

    res.status(200).json(orderItem);
  },
);

/**
 * @method POST
 * @route /api/order-items
 * @description add new order item
 * @access private
 */
export const addNewOrderItems = asyncHandler(
  async (req: Request, res: Response) => {
    const validation = orderItemsSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: validation.error.issues[0].message,
      });
      return;
    }

    const { orderId, productId, quantity, price } = validation.data;

    // Check product
    const product = await db.orm.public.Product.where({
      id: Number(productId),
    }).first();

    if (!product) {
      res.status(404).json({
        message: "product not found",
      });
      return;
    }

    // Check order
    const order = await db.orm.public.Order.where({
      id: Number(orderId),
    }).first();

    if (!order) {
      res.status(404).json({
        message: "order not found",
      });
      return;
    }

    type OrderItemCreateInput = Parameters<
      typeof db.orm.public.OrderItem.create
    >[0];

    const newOrderItem = await db.orm.public.OrderItem.create({
      orderId: Number(orderId),

      productId: Number(productId),

      quantity,

      price: price as unknown as OrderItemCreateInput["price"],
    });

    res.status(201).json(newOrderItem);
  },
);

/**
 * @method PUT
 * @route /api/order-items/:id
 * @description update order item
 * @access private - admin or owner
 */
export const UpdateOrderItems = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "the id is required",
      });
      return;
    }

    const validation = updateOrderItemsSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error.issues[0].message,
      });
      return;
    }

    const { productId, orderId, quantity, price } = validation.data;

    const orderItemQuery = db.orm.public.OrderItem.where({
      id: Number(id),
    });

    const orderItem = await orderItemQuery.first();

    if (!orderItem) {
      res.status(404).json({
        message: "the order item not found",
      });
      return;
    }

    // If productId changed, check product
    if (productId !== undefined) {
      const product = await db.orm.public.Product.where({
        id: Number(productId),
      }).first();

      if (!product) {
        res.status(404).json({
          message: "the provided product was not found",
        });
        return;
      }
    }

    // If orderId changed, check order
    if (orderId !== undefined) {
      const order = await db.orm.public.Order.where({
        id: Number(orderId),
      }).first();

      if (!order) {
        res.status(404).json({
          message: "the provided order was not found",
        });
        return;
      }
    }

    type OrderItemUpdateInput = Parameters<typeof orderItemQuery.update>[0];

    const updateData: OrderItemUpdateInput = {
      ...(productId !== undefined && {
        productId: Number(productId),
      }),

      ...(orderId !== undefined && {
        orderId: Number(orderId),
      }),

      ...(quantity !== undefined && {
        quantity,
      }),

      ...(price !== undefined && {
        price: price as unknown as OrderItemUpdateInput["price"],
      }),
    };

    const updatedOrderItem = await orderItemQuery.update(updateData);

    res.status(200).json(updatedOrderItem);
  },
);

/**
 * @method DELETE
 * @route /api/order-items/:id
 * @description delete order item
 * @access private - admin or owner
 */
export const deleteOrderItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "the id is required",
      });
      return;
    }

    const orderItemQuery = db.orm.public.OrderItem.where({
      id: Number(id),
    });

    const orderItem = await orderItemQuery.first();

    if (!orderItem) {
      res.status(404).json({
        message: "the order item not found",
      });
      return;
    }

    await orderItemQuery.delete();

    res.status(200).json({
      message: "the order item deleted successfully",
    });
  },
);
