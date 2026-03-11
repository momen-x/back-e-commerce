import asyncHandler from "express-async-handler";
import {
  orderItemsSchema,
  updateOrderItemsSchema,
} from "../Validations/Order_items";
import { OrderItem } from "../Models/Order_Item";
import { Product } from "../../Products/Models/Product";
import { Request, Response } from "express";

/**
 *@Method GET
 *@route ~/api/order-items
 * @description get  order items by id
 * @access private just admin can do that
 */
export const getAllOrderItems = asyncHandler(async (req, res) => {
  const orderItems = await OrderItem.find();
  res.status(200).json(orderItems);
  return;
});
/**
 *@Method GET
 *@route ~/api/order-items/:id
 * @description get all order items
 * @access private just admin and the user himself can do that
 */
export const getOrderItemsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "the id is required" });
    return;
  }
  const orderItems = await OrderItem.findById(id);
  if (!orderItems) {
    res.status(404).json({ message: "the order item not found" });
    return;
  }
  res.status(200).json(orderItems);
  return;
});
/**
 *@Method POST
 *@route ~/api/order-items
 * @description add new  order items
 * @access private just the logged in user
 */
export const addNewOrderItems = asyncHandler(async (req, res) => {
  const validation = orderItemsSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues[0].message });
    return;
  }
  const { product, quantity ,price} = validation.data;



  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const newOrderItem = await OrderItem.create({ product, quantity,price });
  res.status(201).json(newOrderItem);
});

/**
 * @method PUT
 * @route /api/order-items/:id
 * @description update the order item
 * @access private admin and user himself can update the order-items
 */
export const UpdateOrderItems = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const validation = updateOrderItemsSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: validation.error.issues[0].message });
      return;
    }

    const { product } = validation.data;



    // If a product ID is provided in the update, ensure it exists.
    if (product) {
      const isProductExists = await Product.findById(product);
      if (!isProductExists) {
        res.status(404).json({ message: "The provided product was not found" });
        return;
      }
    }

    // Use findByIdAndUpdate for an atomic update, returning the new document.
    const updatedOrderItem = await OrderItem.findByIdAndUpdate(
      id,
      { $set: validation.data },
      { new: true },
    );

    if (!updatedOrderItem) {
      res.status(404).json({ message: "The order item not found" });
      return;
    }

    res.status(200).json(updatedOrderItem);
  },
);

/**
 *@Method DELETE
 *@route /api/order-items/:id
 *@description delete order items
 *@access private admin and the user himself can delete the order items
 */
export const deleteOrderItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "the id is required" });
    return;
  }
  const orderItem = await OrderItem.findById(id);
  if (!orderItem) {
    res.status(404).json({ message: "the order item not found" });
    return;
  }
  await orderItem.deleteOne();
  res.status(200).json({ message: "the order item deleted successfully" });
  return;
});
