import express from "express";

import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";

import { profileSchema } from "../schemas/profile.schema.js";

import {
    fetchProfile,
    saveProfile
} from "../controllers/profile.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", fetchProfile);
router.put("/", validate(profileSchema), saveProfile);

export default router;