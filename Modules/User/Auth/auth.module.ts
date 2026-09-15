import { PrismaAuthRepository } from "./repo/auth.js";
import { AuthService } from "./service/auth.js";
import { AuthController } from "./Controller/auth.js";

const repository = new PrismaAuthRepository();
const service = new AuthService(repository);
export const authController = new AuthController(service);
