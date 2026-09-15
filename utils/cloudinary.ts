import cloudinary from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { env } from "../config/env.js";
import type { ImageInput } from "./image.js";

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// export default cloudinary;
export const uploadImage = async (file: ImageInput) => {
  return new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          resource_type: "auto",
          use_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(file.buffer);
  });
};
// export const uploadImage = async (file: any) => {
//   try {
//     const result = await cloudinary.v2.uploader.upload(file, {
//       resource_type: "auto",
//       use_filename: true,
//     });
//     return result;
//   } catch (error) {
//     return error;
//   }
// };
export const removeImage = async (publicId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return error;
  }
};
