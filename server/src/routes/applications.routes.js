import express from "express";
import authenticate from "../middleware/authenticate.js";
import {
    getMyApplications,
    createMyApplication,
    changeApplicationStatus,
    editMyApplication,
    removeMyApplication
} from "../controllers/applications.controller.js";

const router = express.Router();

router.get("/", authenticate, getMyApplications);
router.post("/", authenticate, createMyApplication);
router.patch("/:id/status", authenticate, changeApplicationStatus);
router.put("/:id", authenticate, editMyApplication);
router.delete("/:id", authenticate, removeMyApplication);

export default router;