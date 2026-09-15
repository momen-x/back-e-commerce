import { PrismaUserRepository } from "./repo/resUser.js";
import { UserService } from "./service/user.js";
import { UserController } from "./Controller/User.js";

const repository = new PrismaUserRepository();
const service = new UserService(repository);
export const userController = new UserController(service);
