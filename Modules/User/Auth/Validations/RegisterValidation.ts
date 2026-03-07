import z from "zod";

export const registerValidation = z.object({
  firstName: z.string().min(3).max(50).trim(),
  lastName: z.string().min(3).max(50).trim(),
  email: z.string().email().lowercase().trim(),
  password: z.string().min(6),
});
