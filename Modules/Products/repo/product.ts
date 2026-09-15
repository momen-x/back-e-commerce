import { db } from "../../../src/prisma/db.js";
import { ProductRepository } from "./product-type-repo.js";
import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductPage,
} from "../types/product.js";
export class PrismaProductRepository extends ProductRepository {
  async findById(id: number) {
    return db.orm.public.Product.where({ id }).first();
  }
  async findAll({ page, limit }: ProductPage, categoryId?: number) {
    const products = db.orm.public.Product.include("category", (category) =>
      category.select("id", "title", "description"),
    );
    const query =
      categoryId === undefined
        ? products.orderBy((product) => product.createdAt.desc())
        : products.where({ categoryId });
    return await query
      .offset(limit * (page - 1))
      .limit(limit)
      .all();
  }
  async count() {
    const { total } = await db.orm.public.Product.aggregate((agg) => ({
      total: agg.count(),
    }));
    return total;
  }
  async findCategoryById(id: number) {
    return db.orm.public.Category.where({ id }).first();
  }
  async create(data: ProductCreateInput) {
    return db.orm.public.Product.create(data);
  }
  async update(id: number, data: ProductUpdateInput) {
    return db.orm.public.Product.where({ id }).update(data);
  }
  async delete(id: number) {
    await db.orm.public.Product.where({ id }).delete();
  }
}
