import { PrismaProductRepository } from "./repo/product.js";
import { ProductService } from "./service/product.js";
import { ProductController } from "./Controller/Product.js";

const repository = new PrismaProductRepository();
const service = new ProductService(repository);
export const productController = new ProductController(service);
