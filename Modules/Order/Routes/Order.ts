import express from "express";

import { verifyAdmin, VeriFyToken } from "../../../middlewares/verifyToken.js";

import { orderController } from "../order.module.js";

const router = express.Router();

/**
 * @route GET /api/orders
 * @description Get all orders
 * @access Private - Admin only
 */
router.get("/", verifyAdmin, orderController.getOrders);

/**
 * @route POST /api/orders
 * @description Update order status
 * @access Private - Logged in user
 */
router.post("/", VeriFyToken, orderController.updateOrderStatus);

/**
 * @route GET /api/orders/last-order
 * @description Get the last order for the logged in user
 * @access Private - Logged in user
 */
router.get("/last-order", VeriFyToken, orderController.getLastOrder);
/**
 * @route GET /api/orders/cart
 * @description Get the cart for the logged in user
 * @access Private - Logged in user
 */
router.get("/cart", VeriFyToken, orderController.getCart);
/**
 * @route GET /api/orders/user-orders
 * @description Get all orders for the logged in user
 * @access Private - Logged in user
 */
router.get("/user-orders", VeriFyToken, orderController.getUserOrders);

/**
 * @route GET /api/orders/cart/count
 * @description Get the count of order items in the cart for the logged in user
 * @access Private - Logged in user
 */
router.get("/cart/count", VeriFyToken, orderController.getCartCount);
/**
 * @route PUT /api/orders/:id
 * @description Update order by id
 * @access Private - Order owner or admin
 */
router.put("/:id", VeriFyToken, orderController.updateOrder);

/**
 * @route GET /api/orders/:id
 * @description Get order by id
 * @access Private - Order owner or admin
 */
router.get("/:id", VeriFyToken, orderController.getOrderById);

/**
 * @route DELETE /api/orders/:id
 * @description Delete order by id
 * @access Private - Order owner or admin
 */
router.delete("/:id", VeriFyToken, orderController.deleteOrder);

export default router;
