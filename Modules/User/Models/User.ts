import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxLength: 50,
      trim: true,
    },
    userImage: {
      type: Object,
      default: {
        public_id: null,
        url: "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_1280.png",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
  },
  { timestamps: true },
);
// //generate auth token
export const generateToken = (userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      userImage: this.userImage,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "5d" },
  );
  return token;
});

export const User = mongoose.model("User", userSchema);
