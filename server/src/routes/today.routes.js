
import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
    getMyTodayData
} from "../controllers/today.controller.js";

const router = express.Router();

router.get("/", authenticate, getMyTodayData);

export default router;
