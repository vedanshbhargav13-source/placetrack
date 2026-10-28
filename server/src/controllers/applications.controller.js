import asyncHandler from "../utils/asyncHandler.js";
import { getApplicationsByUserId } from "../services/applications.service.js";

export const getMyApplications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const applications = await getApplicationsByUserId(userId);

    return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});
