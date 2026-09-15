import type { Category } from "../entites/category.js";
import type { CategoryCreateInput, CategoryUpdateInput } from "../types/category.js";



export abstract class CategoryRepository {
  abstract findById(id: number): Promise<Category | null>;
  abstract findAll(): Promise<Category[]>;
  abstract create(data :CategoryCreateInput): Promise<Category>;
  abstract update(id: number, category: CategoryUpdateInput): Promise<Category>;
  abstract delete(id: number): Promise<void>;
}
