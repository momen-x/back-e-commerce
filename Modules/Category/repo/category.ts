import type { Category } from "../entites/category.js";
import { CategoryRepository } from "./category-type-repo.js";
import { db } from "../../../src/prisma/db.js";
import type { CategoryCreateInput, CategoryUpdateInput } from "../types/category.js";

export class PrismaCategoryRepository extends CategoryRepository {
  async findById(id: number): Promise<Category | null> {
    const category = await db.orm.public.Category.where({
      id,
    }).first();

    return category;
  }
  async findAll(): Promise<Category[]> {
    const categories = await db.orm.public.Category.all();
    return categories;
  }
  async create(category: CategoryCreateInput): Promise<Category> {
    const newCategory = await db.orm.public.Category.create(category);
    return newCategory;
  }
  async update(id: number, category: CategoryUpdateInput): Promise<Category> {
    const updateCategory = await db.orm.public.Category.where({ id }).update(
      category,
    );
    if (!updateCategory) {
      throw new Error("something went wrong");
    }

    return updateCategory;
  }
  async delete(id: number): Promise<void> {
    await db.orm.public.Category.where({
      id,
    }).delete();
  }
}
