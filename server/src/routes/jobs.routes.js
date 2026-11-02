import express from "express";

import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import { jobSchema } from "../schemas/job.schema.js";

import {
    listJobs,
    createJob,
    fetchJob,
    editJob,
    removeJob
} from "../controllers/jobs.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", listJobs);
router.post("/", validate(jobSchema), createJob);
router.get("/:id", fetchJob);
router.put("/:id", validate(jobSchema), editJob);
router.delete("/:id", removeJob);

export default router;