import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Product } from "../Models/Product";
import path from "path";
import { addProductSchema, updateProductSchema } from "../Validations/Product";
import { removeImage, uploadImage } from "../../../utils/cloudinary";

import fs from "fs";
import { Category } from "../../Category/Models/Category";
import { upload } from "../../../middlewares/photoUpload";

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
    let countProduct = Number(req.query.limit);
    if (!countProduct) {
      countProduct = countOfProductInAllPage;
    }
    const Products = await Product.find()
      .skip(countProduct * (page - 1))
      .limit(countProduct)
      .populate("categoryId", ["title", "description", "_id"])
      .sort({ createdAt: -1 });

    res.status(200).json(Products);
    return;
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
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json("category not found");
      return;
    }

    const products = await Product.find({ categoryId: id })
      .skip(countProduct * (page - 1))
      .limit(countProduct)
      .populate("categoryId", ["title", "description", "_id"]);

    if (products.length === 0) {
      res.status(200).json({
        message: "No products found in this category",
        products: [],
      });
      return;
    }
    const getProducts = await Product.find({ categoryId: id });
    const productsCount = getProducts.length;
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
    const Products = await Product.find();
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
    // 1- Validation
    const validation = addProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    const { categoryId, description, price, title } = validation.data;

    // 2- Upload image to Cloudinary if provided
    let productImage = null;
    if (req.file) {
      const result: any = await uploadImage(req.file);
      if (!result?.public_id) {
        res.status(500).json("Error uploading image");
        return;
      }
      productImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // 3- Create and save the product
    const newProduct = new Product({
      title,
      description,
      price,
      categoryId,
      ...(productImage && { image: productImage }), // only add if image exists
    });

    await newProduct.save();

    // 4- Send response
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
    const product = await Product.findById(id);
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
    // 1- Validate id
    const { id } = req.params;
    if (!id) {
      res.status(400).json("id is required");
      return;
    }

    // 2- Validate body
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    // 3- Find product
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json("product not found");
      return;
    }

    // 4- Handle image upload
    let imageData = (product as any).image; // keep old image by default

    if (req.file) {
      // Upload new image first
      const result: any = await uploadImage(req.file);
      if (!result?.public_id) {
        res.status(500).json("Error uploading image");
        return;
      }

      // ✅ Delete old image from Cloudinary if it exists
      if (imageData?.public_id) {
        await removeImage(imageData.public_id);
      }

      // ✅ Use the new image
      imageData = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // 5- Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        image: imageData, // ✅ new image if uploaded, old image if not
      },
      { new: true },
    );

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
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json("product not found");
      return;
    }
    if (product.image.public_id) {
      await removeImage(product.image.public_id);
    }

    res.status(200).json({ message: "product deleted successfully" });
    return;
  },
);
