import { Router } from "express";
import { sendEnquiry, getAll } from "../controllers/EmailController.js";

const router = Router();


router.post("/send-enquiry", sendEnquiry)
router.get("/all", getAll)

export default router;