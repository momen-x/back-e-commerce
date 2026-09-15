import express from "express";
import { verifyAdmin } from "../../../middlewares/verifyToken.js";

import { CategoryService } from "../service/category.js";
import { PrismaCategoryRepository } from "../repo/category.js";
import { CategoryController } from "../Controller/Category.js";

const router = express.Router();

const categoryRepository = new PrismaCategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(verifyAdmin, categoryController.addCategory);

router
  .route("/:id")
  .get(categoryController.getCategoryById)
  .put(verifyAdmin, categoryController.updateCategory)
  .delete(verifyAdmin, categoryController.deleteCategory);

export default router;
