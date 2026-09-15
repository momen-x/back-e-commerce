import { CategoryRepository } from "../repo/category-type-repo.js";
import { CategoryCreateInput, CategoryUpdateInput } from "../types/category.js";

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategories() {
    return this.categoryRepository.findAll();
  }

  async getOneCategory(id: number) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async createCategory(data: CategoryCreateInput) {
    return this.categoryRepository.create(data);
  }

  async updateCategory(id: number, data: CategoryUpdateInput) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    await this.categoryRepository.delete(id);
  }
}
