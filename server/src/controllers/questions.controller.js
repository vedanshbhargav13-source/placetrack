import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import { questionSchema, questionPatchSchema } from "../schemas/question.schema.js";
import { createQuestion, deleteQuestion, listQuestions, updateQuestion } from "../services/questions.service.js";

const parseId = value => { const r = idSchema.safeParse(value); if (!r.success) throw new AppError("Invalid question ID", 400); return r.data; };
export const getQuestions = asyncHandler(async (req, res) => {
    const data = await listQuestions(req.user.id, { q: String(req.query.q ?? "").trim(), topic: String(req.query.topic ?? "").trim() });
    res.json({ success: true, count: data.length, data });
});
export const postQuestion = asyncHandler(async (req, res) => {
    const p = questionSchema.safeParse(req.body); if (!p.success) throw p.error;
    const data = await createQuestion(req.user.id, p.data); res.status(201).json({ success: true, data });
});
export const patchQuestion = asyncHandler(async (req, res) => {
    const p = questionPatchSchema.safeParse(req.body); if (!p.success) throw p.error;
    const data = await updateQuestion(req.user.id, parseId(req.params.id), p.data); res.json({ success: true, data });
});
export const removeQuestion = asyncHandler(async (req, res) => {
    await deleteQuestion(req.user.id, parseId(req.params.id)); res.status(204).send();
});
