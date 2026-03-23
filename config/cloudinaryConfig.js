import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
import multer from 'multer';



dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,

});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    console.log("File in cloudinary config :")
    console.log(file)
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
}
// configure cloudinary storage
const storage = multer.memoryStorage();
export const upload = multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:10*1024*1024} // 10MB limit
})

export { cloudinary };


