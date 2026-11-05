
import asyncHandler from "../utils/asyncHandler.js";

import {
    getTodayData
} from "../services/today.service.js";

export const getMyTodayData = asyncHandler(async (req, res) => {
    const todayData = await getTodayData(req.user.id);

    return res.status(200).json({
        success: true,
        data: todayData
    });
});
