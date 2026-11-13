import express from "express";
import authenticate from "../middleware/authenticate.js";
import { exportCalendar } from "../controllers/calendar.controller.js";

const router = express.Router();
router.get("/calendar.ics", authenticate, exportCalendar);
export default router;
