import asyncHandler from "../utils/asyncHandler.js";
import { getFollowUps, getPlanner } from "../services/planner.service.js";

export const planner = asyncHandler(async (req, res) => {
    const items = await getPlanner(req.user.id);
    res.json({ success: true, count: items.length, data: items });
});

export const followUps = asyncHandler(async (req, res) => {
    const items = await getFollowUps(req.user.id);
    res.json({ success: true, count: items.length, data: items });
});
