
import asyncHandler from "../utils/asyncHandler.js";

import {
    getDashboardStats
} from "../services/dashboard.service.js";

export const getMyDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats(req.user.id);

    return res.status(200).json({
        success: true,
        data: stats
    });
});
