import z from "zod";

export const updateUserInfoValidation = z.object({
  firstName: z.string().min(3).max(50).trim().optional(),
  lastName: z.string().min(3).max(50).trim().optional(),
 userImage: z.object({
    public_id: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
});

