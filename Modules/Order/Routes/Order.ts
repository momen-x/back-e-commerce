import express from "express";
import {
  verifyAdmin,
  verifyTokenAndAuthorization,
  VeriFyToken,
} from "../../../middlewares/verifyToken";
import {
  addOrder,
  deleteOrder,
  getLastOrder,
  getOrderById,
  getOrders,
  getUserOrders,
} from "../Controller/Order";

const router = express.Router();

router.route("/").get(verifyAdmin, getOrders).post(VeriFyToken, addOrder);
router.route("/last-order").get(VeriFyToken, getLastOrder);
router.route("/user-orders").get(VeriFyToken, getUserOrders);
router
  .route("/:id")
  .get(verifyTokenAndAuthorization, getOrderById)
  .delete(VeriFyToken, deleteOrder);
export default router;
