import { Router } from "express";
import { upload } from "../config/cloudinaryConfig.js";

const router = Router();
import {
  getAllImagesByCategory,
  getImagesByCategory,
  uploadImage,
  deleteImage,
  getImage,
  updateImage,
    getAllImages
} from "../controllers/ImageController.js";
import authMiddleware from "../middles/authMiddleware.js";

// Routes
router.route("/")
    .get(getAllImagesByCategory)
    .post( authMiddleware, upload.single("image"), uploadImage); // Changed from "avatar" to "image"

router.get("/all-images", getAllImages);
router.route("/:id")
    .get(getImage)
    .put(authMiddleware, upload.single("image"),  updateImage) // Added upload middleware
    .delete(authMiddleware, deleteImage);

router.get("/category/:id", getImagesByCategory)
// router.get("/category-bridal-bouquets", getAllBridalBouquets);  
export default router;