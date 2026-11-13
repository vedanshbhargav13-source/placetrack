import express from "express";
import authenticate from "../middleware/authenticate.js";
import { putFollowUp } from "../controllers/followups.controller.js";

const router = express.Router();
router.put("/applications/:id/follow-up", authenticate, putFollowUp);
export default router;
