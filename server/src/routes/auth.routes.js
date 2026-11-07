import authenticate from "../middleware/authenticate.js";
import express from "express";
import authLimiter from "../middleware/authLimiter.js";

import {
    signup,
    login
} from "../controllers/auth.controller.js";

import validate from "../middleware/validate.js";

import {
    signupSchema,
    loginSchema
} from "../schemas/auth.schema.js";

const router = express.Router();

router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
});
router.post("/signup", authLimiter, validate(signupSchema), signup);

router.post("/login", authLimiter, validate(loginSchema), login);

export default router;