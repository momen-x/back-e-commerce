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
  .route("/:id")
  .get(verifyTokenAndAuthorization, orderItemController.getOrderItemsById)
  .put(verifyTokenAndAuthorization, orderItemController.UpdateOrderItems)
  .delete(verifyTokenAndAuthorization, orderItemController.deleteOrderItem);
export default router;
