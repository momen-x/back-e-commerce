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
} from "../Controller/Order";

const router = express.Router();

router.route("/").get(verifyAdmin, getOrderById).post(VeriFyToken, addOrder);
router.route("/last-order").get(VeriFyToken, getLastOrder);
router
  .route("/:id")
  .get(verifyTokenAndAuthorization, getOrders)
  .delete(verifyTokenAndAuthorization, deleteOrder);
export default router;
