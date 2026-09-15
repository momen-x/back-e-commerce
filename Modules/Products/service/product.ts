import type { ProductRepository } from "../repo/product-type-repo.js";
import type {
  AddProductInput,
  EditProductInput,
  ProductCreateInput,
  ProductUpdateInput,
  ProductPage,
} from "../types/product.js";
import type { ImageInput } from "../../../utils/image.js";
import { uploadImage, removeImage } from "../../../utils/cloudinary.js";
import { AppError } from "../../../utils/AppError.js";

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}
  async getAll(page: ProductPage, categoryId?: number) {
    const category =
      categoryId === undefined
        ? "all"
        : await this.repository.findCategoryById(categoryId);
    if (!category) throw new AppError(404, "category not found", "string");
    const products = await this.repository.findAll(page, categoryId);
    // The existing category endpoint reports the count across all products.
    const count = await this.repository.count();
    return {
      success: true,
      count,
      pageCount: Math.ceil(count / page.limit),
      category,
      products,
    };
  }
  async getCount(limit: number) {
    const productsCount = await this.repository.count();
    return { pageCount: Math.ceil(productsCount / limit), productsCount };
  }
  async getById(id: number) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError(404, "product not found", "string");
    return product;
  }
  async create(
    { categoryId, title, description, price }: AddProductInput,
    file?: ImageInput,
  ) {
    if (!(await this.repository.findCategoryById(Number(categoryId))))
      throw new AppError(404, "Category not found");
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    if (file) {
      const result = await uploadImage(file);
      if (!result?.public_id || !result?.secure_url)
        throw new AppError(500, "Error uploading image");
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    return this.repository.create({
      title: title as ProductCreateInput["title"],
      description,
      price: price as unknown as ProductCreateInput["price"],
      imageUrl: imageUrl as ProductCreateInput["imageUrl"],
      categoryId: Number(categoryId),
      ...(imagePublicId !== undefined && { imagePublicId }),
    });
  }
  async update(
    id: number,
    { title, description, price, categoryId }: EditProductInput,
    file?: ImageInput,
  ) {
    const product = await this.getById(id);
    let { imageUrl, imagePublicId } = product;
    if (file) {
      const result = await uploadImage(file);
      if (!result?.public_id || !result?.secure_url)
        throw new AppError(500, "Error uploading image", "string");
      if (imagePublicId) await removeImage(imagePublicId);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    if (
      categoryId !== undefined &&
      !(await this.repository.findCategoryById(Number(categoryId)))
    )
      throw new AppError(404, "category not found", "string");
    return this.repository.update(id, {
      ...(title !== undefined && {
        title: title as ProductUpdateInput["title"],
      }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && {
        price: price as unknown as ProductUpdateInput["price"],
      }),
      ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      imageUrl,
      imagePublicId,
    });
  }
  async delete(id: number) {
    const product = await this.getById(id);
    await this.repository.delete(id);
    if (product.imagePublicId) await removeImage(product.imagePublicId);
  }
}
