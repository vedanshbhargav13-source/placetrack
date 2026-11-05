import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import {
    getApplicationsByUserId,
    createApplication as insertApplication,
    updateApplicationStatus,
    updateApplication,
    deleteApplication
} from "../services/applications.service.js";

import asyncHandler from "../utils/asyncHandler.js";

export const getMyApplications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const applications = await getApplicationsByUserId(userId);

    return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});

export const createMyApplication = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.body.job_id);

    if (!result.success) {
        throw new AppError("Invalid job ID", 400);
    }

    const application = await insertApplication(
        req.user.id,
        result.data
    );

    return res.status(201).json({
        success: true,
        data: application
    });
});

export const changeApplicationStatus = asyncHandler(async (req, res) => {
    const idResult = idSchema.safeParse(req.params.id);

    if (!idResult.success) {
        throw new AppError("Invalid application ID", 400);
    }

    const { status, note } = req.body;

    const allowedStatuses = [
    "Applied",
    "OA Scheduled",
    "Interview",
    "Selected",
    "Rejected"
];

if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid application status", 400);
}

    const application = await updateApplicationStatus(
        req.user.id,
        idResult.data,
        status,
        note
    );

    return res.status(200).json({
        success: true,
        data: application
    });
});

export const editMyApplication = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);
    if (!result.success) throw new AppError("Invalid application ID", 400);

    const application = await updateApplication(
        req.user.id,
        result.data,
        req.body
    );

    if (!application) throw new AppError("Application not found", 404);

    return res.status(200).json({ success: true, data: application });
});

export const removeMyApplication = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);
    if (!result.success) throw new AppError("Invalid application ID", 400);

    const application = await deleteApplication(req.user.id, result.data);

    if (!application) throw new AppError("Application not found", 404);

    return res.status(204).send();
});