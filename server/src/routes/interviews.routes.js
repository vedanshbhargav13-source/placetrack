
import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
    createMyInterview,
    getMyInterviews,
    editMyInterview,
    removeMyInterview
} from "../controllers/interviews.controller.js";

const router = express.Router();

router.post("/applications/:id/interviews", authenticate, createMyInterview);

router.get("/applications/:id/interviews", authenticate, getMyInterviews);

router.put(
    "/applications/:id/interviews/:interviewId",
    authenticate,
    editMyInterview
);

router.delete(
    "/applications/:id/interviews/:interviewId",
    authenticate,
    removeMyInterview
);

export default router;
