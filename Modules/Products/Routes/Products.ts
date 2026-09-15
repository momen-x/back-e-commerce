import express from "express";
import { verifyAdmin } from "../../../middlewares/verifyToken.js";
import { productController } from "../product.module.js";

import { upload } from "../../../middlewares/photoUpload.js";

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(verifyAdmin, upload.single("image"), productController.addProduct);
router.route("/count").get(productController.getProductsCount);
router
  .route("/categories/:categoryId")
  .get(productController.getProductsByCategory);
router
  .route("/:id")
  .get(productController.getProductById)
  .put(verifyAdmin, upload.single("image"), productController.updateProduct)
  .delete(verifyAdmin, productController.deleteProduct);

export default router;
