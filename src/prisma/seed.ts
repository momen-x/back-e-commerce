// import "temporal-polyfill/full/global";
// import { db } from "./db";

// async function seed() {
//   console.log("Seeding database...");

//   // Categories
//   const electronics = await db.orm.public.Category.create({
//     title: "Electronics" as any,
//     description: "Electronic devices and accessories",
//   });

//   const clothes = await db.orm.public.Category.create({
//     title: "Clothes" as any,
//     description: "Men and women clothing",
//   });

//   const books = await db.orm.public.Category.create({
//     title: "Books" as any,
//     description: "Books and educational materials",
//   });

//   console.log("Categories created");

//   // Products
//   await db.orm.public.Product.create({
//     title: "Laptop" as any,
//     description: "Powerful laptop for work and study",
//     price: 1200 as any,
//     imageUrl: "https://example.com/laptop.jpg",
//     imagePublicId: null,
//     categoryId: electronics.id,
//   });

//   await db.orm.public.Product.create({
//     title: "Headphones" as any,
//     description: "Wireless headphones",
//     price: 120 as any,
//     imageUrl: "https://example.com/headphones.jpg",
//     imagePublicId: null,
//     categoryId: electronics.id,
//   });

//   await db.orm.public.Product.create({
//     title: "T-Shirt" as any,
//     description: "Cotton T-Shirt",
//     price: 25 as any,
//     imageUrl: "https://example.com/tshirt.jpg",
//     imagePublicId: null,
//     categoryId: clothes.id,
//   });

//   await db.orm.public.Product.create({
//     title: "JavaScript Book" as any,
//     description: "Advanced JavaScript programming book",
//     price: 45 as any,
//     imageUrl: "https://example.com/js-book.jpg",
//     imagePublicId: null,
//     categoryId: books.id,
//   });

//   console.log("Products created");

//   console.log("Database seeded successfully");
// }

// seed()
//   .catch((error) => {
//     console.error("Seed failed:", error);
//     process.exit(1);
//   })
