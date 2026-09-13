import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { addProductSchema, updateProductSchema } from "../Validations/Product";
import { removeImage, uploadImage } from "../../../utils/cloudinary";

import { upload } from "../../../middlewares/photoUpload";
import { db } from "../../../src/prisma/db";

const countOfProductInAllPage = 8;
const pageOne = 1;

/**
 * @route GET  /api/products?page=:num&limit=:num
 * @description  get all products
 * @access public (logged and un logged users)
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || pageOne;

    const countProduct = Number(req.query.limit) || countOfProductInAllPage;

    const products = await db.orm.public.Product.include(
      "category",
      (category) => category.select("id", "title", "description"),
    )
      .orderBy((product) => product.createdAt.desc())
      .offset(countProduct * (page - 1))
      .limit(countProduct)
      .all();
    const { total: productsCount } = await db.orm.public.Product.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    const PageCount = Math.ceil(productsCount / countProduct);

    res.status(200).json({
      success: true,
      count: productsCount,
      pageCount: PageCount,
      category: "all",
      products,
    });
  },
);
/**
//  * @route GET /products/categories/:categoryId?page=:num&limit=:num
 * @description filtering the products by category
 * @access public 
 */
export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId: id } = req.params;
    const page = Number(req.query.page) || pageOne;
    let countProduct = Number(req.query.limit) || countOfProductInAllPage;
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

    const products = await db.orm.public.Product.where({
      categoryId: Number(id),
    })
      .offset(countProduct * (page - 1))
      .limit(countProduct)
      .include("category", (category) =>
        category.select("id", "title", "description"),
      )
      .all();

    const { total: productsCount } = await db.orm.public.Product.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    const PageCount = Math.ceil(productsCount / countProduct);
    res.status(200).json({
      success: true,
      count: productsCount,
      pageCount: PageCount,
      category: category,
      products,
    });
    return;
  },
);
/**
 * @route GET /api/products/count?limit=:num
 * @description return page @ product count
 * @access public
 */
export const getProductsCount = asyncHandler(
  async (req: Request, res: Response) => {
    let countProduct = Number(req.query.limit);
    if (!countProduct) {
      countProduct = countOfProductInAllPage;
    }
    const Products = await db.orm.public.Product.all();
    const pageCount = Math.ceil(Products.length / countProduct);
    res
      .status(200)
      .json({ pageCount: pageCount, productsCount: Products.length });
    return;
  },
);

/**
 * @route POST  /api/products
 * @description  add new product
 * @access private (Admin only)
 */
export const addProduct = [
  upload.single("image"),

  asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate request body
    const validation = addProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: validation.error.issues[0].message,
      });
      return;
    }

    const { categoryId, description, price, title } = validation.data;

    // 2. Make sure the category exists
    const category = await db.orm.public.Category.where({
      id: Number(categoryId),
    }).first();

    if (!category) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    // 3. Upload image if provided
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (req.file) {
      const result: any = await uploadImage(req.file);

      if (!result?.public_id || !result?.secure_url) {
        res.status(500).json({
          message: "Error uploading image",
        });
        return;
      }

      imagePublicId = result.public_id;
      imageUrl = result.secure_url;
    }

    // 4. Get the exact Prisma 8 create-input type
    type ProductCreateInput = Parameters<
      typeof db.orm.public.Product.create
    >[0];

    const productData: ProductCreateInput = {
      title: title as ProductCreateInput["title"],
      imageUrl: imageUrl as ProductCreateInput["imageUrl"],
      description: description as ProductCreateInput["description"],
      price: price as unknown as ProductCreateInput["price"],

      categoryId: Number(categoryId),

      ...(imagePublicId !== undefined && {
        imagePublicId,
      }),
    };

    // 5. Create product
    const newProduct = await db.orm.public.Product.create(productData);

    // 6. Response
    res.status(201).json(newProduct);
  }),
];
/**
 * @route GET  /api/products/:id
 * @description  get product by id
 * @access public (logged and un logged users)
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const product = await db.orm.public.Product.where({
      id: Number(id),
    }).first();
    if (!product) {
      res.status(404).json("product not found");
      return;
    }
    res.status(200).json(product);
    return;
  },
);
/**
 * @route PUT  /api/products/:id
 * @description  edit product data
 * @access private (admin only)
 */
export const updateProduct = [
  upload.single("image"),

  asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate id
    const { id } = req.params;

    if (!id) {
      res.status(400).json("id is required");
      return;
    }

    const productId = Number(id);

    // 2. Validate body
    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    // 3. Find product
    const productQuery = db.orm.public.Product.where({
      id: productId,
    });

    const product = await productQuery.first();

    if (!product) {
      res.status(404).json("product not found");
      return;
    }

    // 4. Start with old image
    let imageUrl = product.imageUrl;
    let imagePublicId = product.imagePublicId;

    // 5. Upload new image if provided
    if (req.file) {
      const result: any = await uploadImage(req.file);

      if (!result?.public_id || !result?.secure_url) {
        res.status(500).json("Error uploading image");
        return;
      }

      // Delete old Cloudinary image
      if (imagePublicId) {
        await removeImage(imagePublicId);
      }

      // Save new image values
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // 6. Get exact Prisma update type
    type ProductUpdateInput = Parameters<typeof productQuery.update>[0];

    const { title, description, price, categoryId } = validation.data;

    // 7. If categoryId changed, make sure category exists
    if (categoryId !== undefined) {
      const category = await db.orm.public.Category.where({
        id: Number(categoryId),
      }).first();

      if (!category) {
        res.status(404).json("category not found");
        return;
      }
    }

    // 8. Build update data
    const updateData: ProductUpdateInput = {
      ...(title !== undefined && {
        title: title as ProductUpdateInput["title"],
      }),

      ...(description !== undefined && {
        description,
      }),

      ...(price !== undefined && {
        price: price as unknown as ProductUpdateInput["price"],
      }),

      ...(categoryId !== undefined && {
        categoryId: Number(categoryId),
      }),

      imageUrl,
      imagePublicId,
    };

    // 9. Update product
    const updatedProduct = await productQuery.update(updateData);

    res.status(200).json(updatedProduct);
  }),
];

/**
 * @route DELETE  /api/products/:id
 * @description  delete product by id
 * @access private (admin only can delete the product)
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }
    const product = await db.orm.public.Product.where({
      id: Number(id),
    }).first();
    if (!product) {
      res.status(404).json("product not found");
      return;
    }
    await db.orm.public.Product.where({
      id: Number(id),
    }).delete();
    if (product.imagePublicId) {
      await removeImage(product.imagePublicId);
    }

    res.status(200).json({ message: "product deleted successfully" });
    return;
  },
);
