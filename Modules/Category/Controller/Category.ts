import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { addNewCategory, UpdateCategory } from "../Validations/Category";
import { db } from "../../../src/prisma/db";

/**
 * @route GET /api/categories
 * @description get all categories (can make filter by category)
 * @access public (logged and un logged users)
 */
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await db.orm.public.Category.all();
    res.status(200).json(categories);
  },
);

/**
 * @route POST /api/categories
 * @description add new category by admin
 * @access private (just admin can add new category)
 */
export const addCategory = asyncHandler(async (req: Request, res: Response) => {
  const validation = addNewCategory.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      message: validation.error.issues[0].message,
    });
    return;
  }

  const { title, description } = validation.data;

  type CategoryCreateInput = Parameters<
    typeof db.orm.public.Category.create
  >[0];

  const categoryData: CategoryCreateInput = {
    title: title as CategoryCreateInput["title"],
    description,
  };

  const newCategory = await db.orm.public.Category.create(categoryData);

  res.status(201).json(newCategory);
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
    const category = await db.orm.public.Category.where({
      id: Number(id),
    }).first();
    if (!category) {
      res.status(404).json("category not found");
      return;
    }
    res.status(200).json(category);
    return;
  },
);

/**
 * @route PUT /api/categories/:id
 * @description update the category data
 * @access private (admin only can update the category data)
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!id) {
      res.status(400).json("id is required");
      return;
    }

    const categoryId = Number(id);

    const validation = UpdateCategory.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    const categoryQuery = db.orm.public.Category.where({
      id: categoryId,
    });

    const category = await categoryQuery.first();

    if (!category) {
      res.status(404).json("category not found");
      return;
    }

    type CategoryUpdateInput = Parameters<typeof categoryQuery.update>[0];

    const { title, description } = validation.data;

    const updateData: CategoryUpdateInput = {
      ...(title !== undefined && {
        title: title as CategoryUpdateInput["title"],
      }),

      ...(description !== undefined && {
        description,
      }),
    };

    const updatedCategory = await categoryQuery.update(updateData);

    res.status(200).json(updatedCategory);
  },
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

    const category = await db.orm.public.Category.where({
      id: Number(id),
    }).first();
    if (!category) {
      res.status(404).json("category not found");
      return;
    }
    await db.orm.public.Category.where({
      id: Number(id),
    }).delete();
    res
      .status(200)
      .json(
        "category and products belong to this category deleted successfully",
      );
    return;
  },
);
