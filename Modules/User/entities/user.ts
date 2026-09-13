export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userImageUrl: string;
  userImagePublicId: string | null;
  email: string;
  password: string;
  isAdmin: boolean;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
