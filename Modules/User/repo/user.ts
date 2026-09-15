import type { User } from "../entities/user.js";
import type { UserCreateInput, UserUpdateInput } from "../types/user.js";
export abstract class UserRepository {
  abstract findAll(): Promise<User[]>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(data: UserCreateInput): Promise<User>;
  abstract update(id: number, data: UserUpdateInput): Promise<User | null>;
  abstract delete(id: number): Promise<void>;
}
