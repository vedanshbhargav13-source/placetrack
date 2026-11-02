import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
    getProfile,
    upsertProfile
} from "../services/profile.service.js";

export const fetchProfile = asyncHandler(async (req, res) => {
    const profile = await getProfile(req.user.id);

    if (!profile) {
        throw new AppError("Profile not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: profile
    });
});

export const saveProfile = asyncHandler(async (req, res) => {
    const profile = await upsertProfile(req.user.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Profile saved successfully",
        data: profile
    });
});