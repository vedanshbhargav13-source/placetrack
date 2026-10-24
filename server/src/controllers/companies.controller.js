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


export const listCompanies = asyncHandler(async (req, res) => {
    const companies = await fetchCompanies();

    return res.status(200).json(companies);
});


export const createCompany = asyncHandler(async (req, res) => {
    const company = await insertCompany(req.body);

    return res.status(201).json({
        success: true,
        data: company
    });
});


export const getCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await getCompanyById(id);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});


export const updateCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await editCompany(id, req.body);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});


export const deleteCompany = asyncHandler(async (req, res) => {
    const result = idSchema.safeParse(req.params.id);

    if (!result.success) {
        throw new AppError("Invalid company ID", 400);
    }

    const id = result.data;

    const company = await removeCompany(id);

    if (!company) {
        throw new AppError("Company not found", 404);
    }

    return res.status(204).send();
});