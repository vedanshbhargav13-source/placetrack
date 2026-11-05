
import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
    createMyInterview,
    getMyInterviews,
    editMyInterview,
    removeMyInterview
} from "../controllers/interviews.controller.js";

const router = express.Router();

// All interview routes require authentication
router.use(authenticate);

router.post("/applications/:id/interviews", createMyInterview);

router.get("/applications/:id/interviews", getMyInterviews);

router.put(
    "/applications/:id/interviews/:interviewId",
    editMyInterview
);

router.delete(
    "/applications/:id/interviews/:interviewId",
    removeMyInterview
);

export default router;
