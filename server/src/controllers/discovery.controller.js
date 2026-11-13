import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { searchListings } from "../services/discovery.service.js";

export const discoverJobs = asyncHandler(async (req, res) => {
    const query = String(req.query.q ?? "").trim();
    if (query.length > 120) throw new AppError("Search must be 120 characters or fewer.", 400);
    const jobs = await searchListings(query);
    res.setHeader("Cache-Control", "private, max-age=60");
    res.json({ success: true, data: jobs, source: "Remotive", checked_at: new Date().toISOString() });
});
