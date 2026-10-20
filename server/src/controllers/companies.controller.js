import pool from "../db.js";

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

export async function listCompanies(req, res, next) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                company_name AS name,
                website,
                location,
                notes,
                role,
                status,
                created_at
            FROM companies
            ORDER BY id DESC
        `);

        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
}

export async function createCompany(req, res, next) {
    const error = validateCompany(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error
        });
    }

    const { name, website, location, notes } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO companies
                (company_name, website, location, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING
                id,
                company_name AS name,
                website,
                location,
                notes,
                role,
                status,
                created_at`,
            [
                name.trim(),
                website ?? null,
                location ?? null,
                notes ?? null
            ]
        );

        return res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
}

export async function getCompany(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid company ID"
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                id,
                company_name AS name,
                website,
                location,
                notes,
                role,
                status,
                created_at
             FROM companies
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
}

export async function updateCompany(req, res, next) {
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

    const { name, website, location, notes } = req.body;

    try {
        const result = await pool.query(
            `UPDATE companies
             SET company_name = $1,
                 website = $2,
                 location = $3,
                 notes = $4
             WHERE id = $5
             RETURNING
                id,
                company_name AS name,
                website,
                location,
                notes,
                role,
                status,
                created_at`,
            [
                name.trim(),
                website ?? null,
                location ?? null,
                notes ?? null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteCompany(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid company ID"
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM companies
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}