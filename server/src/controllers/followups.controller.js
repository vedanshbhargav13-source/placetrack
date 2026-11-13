import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import { followupSchema } from "../schemas/followup.schema.js";
import { scheduleFollowUp } from "../services/followups.service.js";

export const putFollowUp = asyncHandler(async (req, res) => {
    const id = idSchema.safeParse(req.params.id); if (!id.success) throw new AppError("Invalid application ID", 400);
    const data = followupSchema.safeParse(req.body); if (!data.success) throw data.error;
    const updated = await scheduleFollowUp(req.user.id, id.data, data.data);
    res.json({ success: true, data: updated });
});
