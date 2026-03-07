import express from "express";
import {verifyAdmin} from "../../../middlewares/verifyToken"
import { addCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../Controller/Category";

const router = express.Router();


router.route("/").get(getAllCategories).post(verifyAdmin,addCategory)
router.route("/:id").get(getCategoryById).put(verifyAdmin,updateCategory).delete(verifyAdmin,deleteCategory)
// router.route("/:id/products").get(getProductsByCategory


export default router;
