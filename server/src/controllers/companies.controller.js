import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import { idSchema } from "../schemas/id.schema.js";

import {
    listCompanies as fetchCompanies,
    createCompany as insertCompany,
    getCompanyById,
    updateCompany as editCompany,
    deleteCompany as removeCompany
} from "../services/companies.service.js";


// 1. List companies belonging to the logged-in user
export const listCompanies = asyncHandler(async (req, res) => {
    const companies = await fetchCompanies(req.user.id);

    return res.status(200).json(companies);
});


// 2. Create a company for the logged-in user
export const createCompany = asyncHandler(async (req, res) => {
    const company = await insertCompany(req.body, req.user.id);

    return res.status(201).json({
        success: true,
        data: company
    });
});


// 3. Get a specific company belonging to the logged-in user
export const getCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await getCompanyById(id, req.user.id);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});


// 4. Update a company belonging to the logged-in user
export const updateCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await editCompany(id, req.body, req.user.id);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});


// 5. Delete a company belonging to the logged-in user
export const deleteCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await removeCompany(id, req.user.id);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(204).send();
});