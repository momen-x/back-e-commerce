import z from "zod";

export const addNewCategory = z.object({
  title: z.string().min(3).max(50),
  description: z.string().min(3),
});
export const UpdateCategory = z.object({
  title: z.string().min(3).max(50).optional(),
  description: z.string().min(3).optional(),
});

export type addCategoryType = z.infer<typeof addNewCategory>;
export type updateCategoryType = z.infer<typeof UpdateCategory>;
