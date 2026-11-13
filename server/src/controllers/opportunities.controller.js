import asyncHandler from "../utils/asyncHandler.js";
import { opportunitySchema } from "../schemas/opportunity.schema.js";
import { captureOpportunity } from "../services/opportunities.service.js";

export const captureMyOpportunity = asyncHandler(async (req, res) => {
    const parsed = opportunitySchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const data = await captureOpportunity(req.user.id, parsed.data);
    res.status(data.already_saved ? 200 : 201).json({ success: true, data, message: data.already_saved ? "This listing is already in your tracker." : "Opportunity saved." });
});
