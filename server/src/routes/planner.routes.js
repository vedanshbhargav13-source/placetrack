import express from "express";
import authenticate from "../middleware/authenticate.js";
import { followUps, planner } from "../controllers/planner.controller.js";

const router = express.Router();
router.get("/planner", authenticate, planner);
router.get("/follow-ups", authenticate, followUps);
export default router;
