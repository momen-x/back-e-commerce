import express from "express";
import { verifyAdmin } from "../../../middlewares/verifyToken";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsCount,
  updateProduct,
} from "../Controller/Product";

const router = express.Router();

router.route("/").get(getAllProducts).post(verifyAdmin, addProduct);
router.route("/count").get(getProductsCount);
router.route("/categories/:categoryId").get(getProductsByCategory);
router
  .route("/:id")
  .get(getProductById)
  .put(verifyAdmin, updateProduct)
  .delete(verifyAdmin, deleteProduct);

export default router;
