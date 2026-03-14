import z from "zod";

export const updatePasswordValidation = z  .object({
    oldPassword: z.string().min(1, "the old password is required"),
    newPassword: z
      .string()
      .min(8, "the new password must be at least 8 characters long"),
    confirmNewPassword: z
      .string()
      .min(8, "the confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type UpdatePasswordType = z.infer<typeof updatePasswordValidation>;


export const forgotPasswordValidation = z.object({
  email: z.string().email().lowercase().trim(),
});

export const resetPasswordValidation = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(8),
});