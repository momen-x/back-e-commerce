import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { addNewCategory, UpdateCategory } from "../Validations/Category.js";
import { CategoryService } from "../service/category.js";
import { Varchar } from "@prisma/orm-postgres/target/codec-types";
import { CategoryUpdateInput } from "../entites/category.js";
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  /**
   * @route GET /api/categories
   * @description get all categories (can make filter by category)
   * @access public (logged and un logged users)
   */
  getAllCategories = async (req: Request, res: Response) => {
    const categories = await this.categoryService.getCategories();
    res.status(200).json(categories);
    return;
  };

  /**
   * @route POST /api/categories
   * @description add new category by admin
   * @access private (just admin can add new category)
   */
  addCategory = async (req: Request, res: Response) => {
    const validation = addNewCategory.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error.issues[0].message,
      });
      return;
    }

    const { title, description } = validation.data;

    const newCategory = await this.categoryService.createCategory({
      title: title as Varchar<50>,
      description,
    });

    res.status(201).json(newCategory);
  };

  /**
   * @route GET /api/categories/:id
   * @description get category by id
   * @access public (logged and un logged users)
   */
  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const category = await this.categoryService.getOneCategory(Number(id));
    res.status(200).json(category);
    return;
  });

  /**
   * @route PUT /api/categories/:id
   * @description update the category data
   * @access private (admin only can update the category data)
   */
  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const validation = UpdateCategory.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error.issues[0].message,
      });
      return;
    }

    const { title, description } = validation.data;

    const categoryId = Number(id);
    const updateData: CategoryUpdateInput = {
      ...(title !== undefined && {
        title: title as CategoryUpdateInput["title"],
      }),

      ...(description !== undefined && {
        description,
      }),
    };

    const updatedCategory = await this.categoryService.updateCategory(
      categoryId,
      updateData,
    );

    res.status(200).json(updatedCategory);
  });

  /**
   * @route DELETE /api/categories/:id
   * @description delete  category
   * @access private (admin only can delete the categories)
   */
  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }

    await this.categoryService.deleteCategory(Number(id));
    res
      .status(200)
      .json(
        "category and products belong to this category deleted successfully",
      );
    return;
  });
}
