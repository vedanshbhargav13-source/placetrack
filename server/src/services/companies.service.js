import pool from "../db.js";

export async function listCompanies() {
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

    return result.rows;
}

export async function createCompany({
    name,
    website,
    location,
    notes
}) {
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

    return result.rows[0];
}

export async function getCompanyById(id) {
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

    return result.rows[0] ?? null;
}

export async function updateCompany(
    id,
    { name, website, location, notes }
) {
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

    return result.rows[0] ?? null;
}

export async function deleteCompany(id) {
    const result = await pool.query(
        `DELETE FROM companies
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] ?? null;
}