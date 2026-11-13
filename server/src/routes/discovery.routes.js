import express from "express";
import authenticate from "../middleware/authenticate.js";
import { discoverJobs } from "../controllers/discovery.controller.js";

const router = express.Router();
router.get("/jobs", authenticate, discoverJobs);

export default router;
