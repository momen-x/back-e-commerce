import type { Product } from "../entities/product.js";
import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductPage,
} from "../types/product.js";
import type { Category } from "../../Category/entites/category.js";
export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "title" | "description"> | null;
};
export abstract class ProductRepository {
  abstract findById(id: number): Promise<Product | null>;
  abstract findAll(
    page: ProductPage,
    categoryId?: number,
  ): Promise<ProductWithCategory[]>;
  abstract count(): Promise<number>;
  abstract findCategoryById(id: number): Promise<Category | null>;
  abstract create(data: ProductCreateInput): Promise<Product>;
  abstract update(
    id: number,
    data: ProductUpdateInput,
  ): Promise<Product | null>;
  abstract delete(id: number): Promise<void>;
}
