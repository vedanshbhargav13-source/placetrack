import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { idSchema } from "../schemas/id.schema.js";
import { jobQuerySchema } from "../schemas/jobQuery.schema.js";
import {
    createJob as insertJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} from "../services/jobs.service.js";

// GET all jobs with search, filters, sorting and pagination
export const listJobs = asyncHandler(async (req, res) => {
    const queryResult = jobQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
        throw new AppError("Invalid query parameters", 400);
    }

    const jobs = await getJobs(req.user.id, queryResult.data);

    return res.status(200).json({
        success: true,
        data: jobs.data,
        pagination: jobs.pagination
    });
});

// POST create job
export const createJob = asyncHandler(async (req, res) => {
    const job = await insertJob(req.user.id, req.body);

    if (!job) {
        throw new AppError("Company not found", 404);
    }

    return res.status(201).json({
        success: true,
        data: job
    });
});

// GET one job
export const fetchJob = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid job ID", 400);
    }

    const job = await getJobById(req.user.id, result.data);

    if (!job) {
        throw new AppError("Job not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: job
    });
});

// PUT update job
export const editJob = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid job ID", 400);
    }

    const job = await updateJob(
        req.user.id,
        result.data,
        req.body
    );

    if (!job) {
        throw new AppError("Job or company not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: job
    });
});

// DELETE job
export const removeJob = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid job ID", 400);
    }

    const job = await deleteJob(req.user.id, result.data);

    if (!job) {
        throw new AppError("Job not found", 404);
    }

    return res.status(204).send();
});