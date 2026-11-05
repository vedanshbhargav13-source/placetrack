
import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
    getMyDashboardStats
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", authenticate, getMyDashboardStats);

export default router;
