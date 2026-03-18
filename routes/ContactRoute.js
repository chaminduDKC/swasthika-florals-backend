import { Router } from "express"
import { CreateContact, UpdateContact, DeleteContact, GetContact, GetAllContact } from "../controllers/ContactController.js"
const router = Router();

router.post("/", CreateContact)
router.put("/:id", UpdateContact)
router.delete("/:id", DeleteContact)
router.get("/:id", GetContact)
router.get("/", GetAllContact)

export default router;