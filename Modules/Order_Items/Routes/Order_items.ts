import express from "express";
import {
  verifyAdmin,
  verifyTokenAndAuthorization,
  VeriFyToken
} from "../../../middlewares/verifyToken";
import {
  getAllOrderItems,
  getOrderItemsById,
  addNewOrderItems,
  deleteOrderItem,
  UpdateOrderItems,
} from "../Controller/order_items";
const router = express.Router();

router
  .route("/")
  .get(verifyAdmin, getAllOrderItems)
  .post(VeriFyToken, addNewOrderItems);
router
  .route("/:id")
  .get(verifyTokenAndAuthorization, getOrderItemsById)
  .put(verifyTokenAndAuthorization, UpdateOrderItems)
  .delete(verifyTokenAndAuthorization, deleteOrderItem);
export default router;
