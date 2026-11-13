import express from "express";
import authenticate from "../middleware/authenticate.js";
import { compareMyApplications, getMyPreferences, putMyPreferences } from "../controllers/compare.controller.js";

const router = express.Router();
router.get("/applications/compare", authenticate, compareMyApplications);
router.get("/profile/priorities", authenticate, getMyPreferences);
router.put("/profile/priorities", authenticate, putMyPreferences);
export default router;
