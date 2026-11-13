import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getQuestions, patchQuestion, postQuestion, removeQuestion } from "../controllers/questions.controller.js";

const router = express.Router();
router.get("/", authenticate, getQuestions);
router.post("/", authenticate, postQuestion);
router.patch("/:id", authenticate, patchQuestion);
router.delete("/:id", authenticate, removeQuestion);
export default router;
