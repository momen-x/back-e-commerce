import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET_KEY: z.string().min(32),
  //   JWT_REFRESH_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  // STRIPE_API_KEY: z.string().min(1),
  // STRIPE_WEBHOOK_SECRET: z.string().min(1),
  BASE_FRONT_URL: z.string().url(),
  EMAIL_USER: z.string().min(1),
  EMAIL_PASS: z.string().min(1),
  // CORS_ORIGIN: z.string().url(),
});
export const env = envSchema.parse(process.env);
