import asyncHandler from "../utils/asyncHandler.js";

import {
    listCompanies as fetchCompanies,
    createCompany as insertCompany,
    getCompanyById,
    updateCompany as editCompany,
    deleteCompany as removeCompany
} from "../services/companies.service.js";

function validateCompany(body) {
    const { name, website, location, notes } = body;

    if (typeof name !== "string" || name.trim() === "") {
        return "Company name is required";
    }

    if (name.trim().length > 100) {
        return "Company name must not exceed 100 characters";
    }

    if (website !== undefined && website !== null && typeof website !== "string") {
        return "Website must be a string";
    }

    if (location !== undefined && location !== null && typeof location !== "string") {
        return "Location must be a string";
    }

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
        return "Notes must be a string";
    }

    return null;
}

export const listCompanies = asyncHandler(async (req, res) => {
    const companies = await fetchCompanies();
    return res.status(200).json(companies);
});

export const createCompany = asyncHandler(async (req, res) => {
    const error = validateCompany(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error
        });
    }

    const company = await insertCompany(req.body);

    return res.status(201).json({
        success: true,
        data: company
    });
});

export const getCompany = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid company ID"
        });
    }

    const company = await getCompanyById(id);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: "Company not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});

export const updateCompany = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid company ID"
        });
    }

    const error = validateCompany(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error
        });
    }

    const company = await editCompany(id, req.body);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: "Company not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: company
    });
});

export const deleteCompany = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid company ID"
        });
    }

    const company = await removeCompany(id);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: "Company not found"
        });
    }

    return res.status(204).send();
});