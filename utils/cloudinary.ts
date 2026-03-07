import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export default cloudinary;
export const uploadImage = async (file: any) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      resource_type: "auto",
      use_filename: true,
    });
    return result;
  } catch (error) {
    return error;
  }
};
export const removeImage = async (publicId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return error;
  }
};
