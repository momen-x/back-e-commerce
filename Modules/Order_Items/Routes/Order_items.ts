import express from "express";
import {
  verifyAdmin,
  verifyTokenAndAuthorization,
  VeriFyToken,
} from "../../../middlewares/verifyToken.js";
import { orderItemController } from "../order_items.module.js";
const router = express.Router();

router
  .route("/")
  .get(verifyAdmin, orderItemController.getAllOrderItems)
  .post(VeriFyToken, orderItemController.addNewOrderItems);
router
  .route("/orders/:orderId")
  .get(verifyTokenAndAuthorization, orderItemController.getOrderItemsByOrderId);
router
  .route("/:id")
  .get(verifyTokenAndAuthorization, orderItemController.getOrderItemsById)
  .delete(verifyTokenAndAuthorization, orderItemController.deleteOrderItem);
export default router;
