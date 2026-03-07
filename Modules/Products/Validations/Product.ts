import z from "zod";


export const addProductSchema = z.object({
    title:z.string().min(3).max(50),
    description:z.string().min(3),
price: z.coerce.number().min(1),
    categoryId:z.string(),
    
});

export const updateProductSchema = z.object({
    title:z.string().min(3).max(50).optional(),
    description:z.string().min(3).optional(),
    price:z.coerce.number().min(1).optional(),
    categoryId:z.string().optional(),
})