import { cloudinary } from "../config/cloudinaryConfig.js";

export const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary success:', result.public_id);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

