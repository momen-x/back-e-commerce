import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Category } from '../Models/Category';
import { Product } from "../../Products/Models/Product";
import { addNewCategory, UpdateCategory } from "../Validations/Category";

/**
 * @route GET /api/categories
 * @description get all categories (can make filter by category)
 * @access public (logged and un logged users)
 */
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find();
    res.status(200).json(categories);
  }
);

/**
 * @route POST /api/categories
 * @description add new category by admin
 * @access private (just admin can add new category)
 */
export const addCategory = asyncHandler(async (req: Request, res: Response) => {
  const validation = addNewCategory.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json(validation.error.issues[0].message);
    return;
  }
  const { description, title } = validation.data;
  const newCategory = await Category.create({ description, title });
  res.status(201).json(newCategory);
  return;
});

/**
 * @route GET /api/categories/:id
 * @description get category by id
 * @access public (logged and un logged users)
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json("category not found");
      return;
    }
    res.status(200).json(category);
    return;
  }
);

/**
 * @route PUT /api/categories/:id
 * @description update the category data
 * @access private (admin only can update the category data)
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // console.log("the id is : ",id);
    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const validation = UpdateCategory.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json("category not found");
      return;
    }
    const updateCategoryById = await Category.findByIdAndUpdate(
      id,
      validation.data,
      { new: true }
    );
    res.status(200).json(updateCategoryById);
    return;
  }
);

/**
 * @route DELETE /api/categories/:id
 * @description delete  category
 * @access private (admin only can delete the categories)
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }

    const category = await Category.findById(id);
    if(!category){
      res.status(404).json("category not found");
      return;
    }
    await Product.deleteMany({ category: id });
    await Category.findByIdAndDelete(id);
    res.status(200).json("category and products belong to this category deleted successfully");
    return;
  }
);


