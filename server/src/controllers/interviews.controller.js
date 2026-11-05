
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { idSchema } from "../schemas/id.schema.js";

import {
    createInterview,
    getInterviewsByApplicationId,
    updateInterview,
    deleteInterview
} from "../services/interviews.service.js";


// 1. CREATE interview
export const createMyInterview = asyncHandler(async (req, res) => {
    const applicationResult = idSchema.safeParse(req.params.id);

    if (!applicationResult.success) {
        throw new AppError("Invalid application ID", 400);
    }

    const interview = await createInterview(
        req.user.id,
        applicationResult.data,
        req.body
    );

    return res.status(201).json({
        success: true,
        data: interview
    });
});


// 2. GET interviews
export const getMyInterviews = asyncHandler(async (req, res) => {
    const applicationResult = idSchema.safeParse(req.params.id);

    if (!applicationResult.success) {
        throw new AppError("Invalid application ID", 400);
    }

    const interviews = await getInterviewsByApplicationId(
        req.user.id,
        applicationResult.data
    );

    return res.status(200).json({
        success: true,
        count: interviews.length,
        data: interviews
    });
});


// 3. UPDATE interview
export const editMyInterview = asyncHandler(async (req, res) => {
    const applicationResult = idSchema.safeParse(req.params.id);
    const interviewResult = idSchema.safeParse(req.params.interviewId);

    if (!applicationResult.success || !interviewResult.success) {
        throw new AppError("Invalid application or interview ID", 400);
    }

    const interview = await updateInterview(
        req.user.id,
        applicationResult.data,
        interviewResult.data,
        req.body
    );

    if (!interview) {
        throw new AppError("Interview not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: interview
    });
});


// 4. DELETE interview
export const removeMyInterview = asyncHandler(async (req, res) => {
    const applicationResult = idSchema.safeParse(req.params.id);
    const interviewResult = idSchema.safeParse(req.params.interviewId);

    if (!applicationResult.success || !interviewResult.success) {
        throw new AppError("Invalid application or interview ID", 400);
    }

    const interview = await deleteInterview(
        req.user.id,
        applicationResult.data,
        interviewResult.data
    );

    if (!interview) {
        throw new AppError("Interview not found", 404);
    }

    return res.status(204).send();
});
