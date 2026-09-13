import express from "express";

import { verifyAdmin, VeriFyToken } from "../../../middlewares/verifyToken";

import {
  addOrder,
  deleteOrder,
  getLastOrder,
  getOrderById,
  getOrders,
  getUserOrders,
} from "../Controller/Order";

const router = express.Router();

/**
 * @route GET /api/orders
 * @description Get all orders
 * @access Private - Admin only
 */
router.get("/", verifyAdmin, getOrders);

/**
 * @route POST /api/orders
 * @description Create a new order
 * @access Private - Logged in user
 */
router.post("/", VeriFyToken, addOrder);

/**
 * @route GET /api/orders/last-order
 * @description Get the last order for the logged in user
 * @access Private - Logged in user
 */
router.get("/last-order", VeriFyToken, getLastOrder);

/**
 * @route GET /api/orders/user-orders
 * @description Get all orders for the logged in user
 * @access Private - Logged in user
 */
router.get("/user-orders", VeriFyToken, getUserOrders);

/**
 * @route GET /api/orders/:id
 * @description Get order by id
 * @access Private - Order owner or admin
 */
router.get("/:id", VeriFyToken, getOrderById);

/**
 * @route DELETE /api/orders/:id
 * @description Delete order by id
 * @access Private - Order owner or admin
 */
router.delete("/:id", VeriFyToken, deleteOrder);

export default router;
