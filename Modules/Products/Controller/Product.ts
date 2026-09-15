import asyncHandler from "express-async-handler";
import type { ProductService } from "../service/product.js";
import {
  addProductSchema,
  updateProductSchema,
} from "../Validations/Product.js";

export class ProductController {
  constructor(private readonly service: ProductService) {}
  getAllProducts = asyncHandler(async (req, res) => {
    res
      .status(200)
      .json(
        await this.service.getAll({
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 8,
        }),
      );
  });
  getProductsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      res.status(400).json("id is required");
      return;
    }
    res
      .status(200)
      .json(
        await this.service.getAll(
          {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 8,
          },
          Number(categoryId),
        ),
      );
  });
  getProductsCount = asyncHandler(async (req, res) => {
    res
      .status(200)
      .json(await this.service.getCount(Number(req.query.limit) || 8));
  });
  getProductById = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json("id is required");
      return;
    }
    res.status(200).json(await this.service.getById(Number(req.params.id)));
  });
  addProduct = asyncHandler(async (req, res) => {
    const validation = addProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: validation.error.issues[0].message });
      return;
    }
    res.status(201).json(await this.service.create(validation.data, req.file));
  });
  updateProduct = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json("id is required");
      return;
    }
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }
    res
      .status(200)
      .json(
        await this.service.update(
          Number(req.params.id),
          validation.data,
          req.file,
        ),
      );
  });
  deleteProduct = asyncHandler(async (req, res) => {
    if (!req.params.id) {
      res.status(400).json("id is required");
      return;
    }
    await this.service.delete(Number(req.params.id));
    res.status(200).json({ message: "product deleted successfully" });
  });
}
