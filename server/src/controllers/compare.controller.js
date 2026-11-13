import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { preferencesSchema } from "../schemas/preferences.schema.js";
import { compareApplications, getPreferences, savePreferences } from "../services/compare.service.js";

export const getMyPreferences = asyncHandler(async (req, res) => res.json({ success: true, data: await getPreferences(req.user.id) }));
export const putMyPreferences = asyncHandler(async (req, res) => {
    const parsed = preferencesSchema.safeParse(req.body); if (!parsed.success) throw parsed.error;
    const data = await savePreferences(req.user.id, parsed.data); res.json({ success: true, data });
});
export const compareMyApplications = asyncHandler(async (req, res) => {
    const raw = String(req.query.ids ?? "");
    const ids = raw.split(",").map(Number);
    if (!raw || ids.some(id => !Number.isSafeInteger(id) || id <= 0) || new Set(ids).size !== ids.length) throw new AppError("Provide unique application IDs as a comma-separated list", 400);
    const data = await compareApplications(req.user.id, ids);
    res.json({ success: true, data });
});
