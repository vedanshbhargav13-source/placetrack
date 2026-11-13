import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import {
    getApplicationsByUserId,
    createApplication as insertApplication,
    updateApplicationStatus,
    updateApplication,
    deleteApplication
} from "../services/applications.service.js";
import { applicationQuerySchema } from "../schemas/applicationQuery.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import { applicationEditSchema } from "../schemas/applicationEdit.schema.js";
import { applicationStatusSchema } from "../schemas/applicationStatus.schema.js";

export const getMyApplications = asyncHandler(async (req, res) => {
    const queryResult = applicationQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
        throw new AppError("Invalid query parameters", 400);
    }

    const applications = await getApplicationsByUserId(
        req.user.id,
        queryResult.data
    );

    return res.status(200).json({
        success: true,
        count: applications.data.length,
        data: applications.data,
        pagination: applications.pagination
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

    const bodyResult = applicationStatusSchema.safeParse(req.body);
    if (!bodyResult.success) throw bodyResult.error;
    const { status, note } = bodyResult.data;

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

    const editResult = applicationEditSchema.safeParse(req.body);
    if (!editResult.success) throw editResult.error;

    const application = await updateApplication(
        req.user.id,
        result.data,
        editResult.data
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
