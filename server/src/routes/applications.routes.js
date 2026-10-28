import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getMyApplications } from "../controllers/applications.controller.js";

const router = express.Router();

router.get("/", authenticate, getMyApplications);

export default router;
