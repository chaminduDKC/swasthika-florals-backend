import { Router } from "express"
import { CreateCategory, UpdateCategory,getOtherCats, getBridalBouquetCat, DeleteCategory,getEngagementCat, GetCategory, GetAllMainCategories, GetAllCategories } from "../controllers/CategoryController.js"
import {upload} from "../config/cloudinaryConfig.js";
const router = Router();

router.post("/",upload.single('image'), CreateCategory)
router.put("/:id", upload.single('image'), UpdateCategory)
router.get("/engagement", getEngagementCat)
router.get("/bridal-bouquets", getBridalBouquetCat)
router.get("/all", GetAllCategories)
router.get("/others", getOtherCats)
router.delete("/:id", DeleteCategory)
router.get("/:id", GetCategory)
router.get("/", GetAllMainCategories)



export default router;