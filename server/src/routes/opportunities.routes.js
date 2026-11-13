import express from "express";
import authenticate from "../middleware/authenticate.js";
import { captureMyOpportunity } from "../controllers/opportunities.controller.js";

const router = express.Router();
router.post("/", authenticate, captureMyOpportunity);
export default router;
