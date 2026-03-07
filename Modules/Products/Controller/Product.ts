import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Product } from "../Models/Product";
import path from "path";
import { addProductSchema, updateProductSchema } from "../Validations/Product";
import { removeImage, uploadImage } from "../../../utils/cloudinary";
import photoUpload from "../../../middlewares/photoUpload";

import fs from "fs";
import { Category } from "../../Category/Models/Category";

const countOfProductInAllPage = 8;
const pageOne=1;

/**
 * @route GET  /api/products?page=:num&limit=:num
 * @description  get all products
 * @access public (logged and un logged users)
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
  const page = Number(req.query.page) ||pageOne;
  let countProduct = Number(req.query.limit);
  if(!countProduct){
countProduct=countOfProductInAllPage;
  }
 const Products = await Product.find()
    .skip(countProduct * (page - 1))
    .limit(countProduct).populate("categoryId",[
      "title",
      "description",
      "_id",
    ]).sort({createdAt:-1});
    
    res.status(200).json(Products);
    return;
  }
);
/**
//  * @route GET /products/categories/:categoryId?page=:num&limit=:num
 * @description filtering the products by category
 * @access public 
 */
export const getProductsByCategory=asyncHandler(async(req:Request,res:Response)=>{
  const {categoryId:id}=req.params;
  const page=Number(req.query.page) ||pageOne;
  let countProduct=Number(req.query.limit) || countOfProductInAllPage;
  if(!id){
    res.status(400).json("id is required");
    return;
  }
  const category=await Category.findById(id);
  if(!category){
    res.status(404).json("category not found");
    return;
  }


  const products=await Product.find({categoryId:id}).skip(countProduct * (page - 1))
    .limit(countProduct).populate("categoryId",[
      "title",
      "description",
      "_id",
    ]);

  if (products.length === 0) {
  res.status(200).json({ 
    message: "No products found in this category",
    products: [] 
  });
  return;
}
const getProducts=await Product.find({categoryId:id})
const productsCount=getProducts.length;
const PageCount=Math.ceil(productsCount/countProduct);
    res.status(200).json({
      success: true,
      count: productsCount,
      pageCount:PageCount,
      category: category,
      products
    });  return;
});
/**
 * @route GET /api/products/count?limit=:num
 * @description return page @ product count
 * @access public 
 */
export const getProductsCount = asyncHandler(async (req: Request, res: Response) => {
    let countProduct = Number(req.query.limit);
    if (!countProduct) {
     countProduct=countOfProductInAllPage;
    }
  const Products = await Product.find();
    const pageCount=Math.ceil(Products.length / countProduct);
    res.status(200).json({pageCount:pageCount,productsCount:Products.length});
    return;

});

/**
 * @route POST  /api/products
 * @description  add new product
 * @access private (Admin only)
 */
export const addProduct = [
  photoUpload.single("image"),

  asyncHandler(async (req: Request, res: Response) => {
     console.log("req.body:", req.body);      // see what's coming in
    console.log("req.file:", req.file);      // see what's coming in

    const validation = addProductSchema.safeParse(req.body);
    if (!validation.success) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const imagePath = path.join(
          __dirname,
          "../../../images",
          req.file.filename
        );
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    const { categoryId, description, price, title } = validation.data;

    const newProduct = new Product({ title, description, price, categoryId });

    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../../images",
        req.file.filename
      );
      try {
        const result: any = await uploadImage(imagePath);
        if (!result?.public_id) {
          res.status(500).json("Error uploading image");
          return;
        }
        (newProduct as any).image  = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      } catch (error) {
        res.status(500).json("Error uploading image");
        return;
      } finally {
        // Always clean up the local file
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    }

    await newProduct.save();
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
  }
);
/**
 * @route PUT  /api/products/:id
 * @description  edit product data
 * @access private (admin only)
 */
export const updateProduct = [
  photoUpload.single("image"),

  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const cleanupFile = () => {
      if (req.file) {
        const p = path.join(__dirname, "../../../images", req.file.filename);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    };

    if (!id) {
      cleanupFile();
      res.status(400).json("id is required");
      return;
    }

    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      cleanupFile();
      res.status(400).json(validation.error.issues[0].message);
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      cleanupFile();
      res.status(404).json("product not found");
      return;
    }

    // ✅ Use the correct field name that matches your Mongoose schema
    let imageData = (product as any).image;

    if (req.file) {
      const imagePath = path.join(__dirname, "../../../images", req.file.filename);
      try {
        const result: any = await uploadImage(imagePath);

        // ✅ Check upload actually succeeded
        if (!result?.public_id || !result?.secure_url) {
          res.status(500).json("Cloudinary upload failed");
          return;
        }

        // ✅ Delete old image from Cloudinary
        if (imageData?.public_id) {
          await removeImage(imageData.public_id);
        }

        imageData = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      } catch (error) {
        res.status(500).json("Error uploading image");
        return;
      } finally {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        image: imageData, // ✅ Must match your schema field name
      },
      { new: true }
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
if(product.image.public_id){
    await removeImage(product.image.public_id);
}

    res.status(200).json({ message: "product deleted successfully" });
    return;
  }
);
