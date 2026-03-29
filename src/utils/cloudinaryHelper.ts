// src/utils/cloudinaryHelper.ts
import cloudinary from "../config/cloudinary"; // ඔයාගේ cloudinary config ෆයිල් එක

export const uploadToCloudinary = (
  fileBuffer: Buffer, 
  folder: string, 
  resourceType: "image" | "video" | "raw" = "image"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};