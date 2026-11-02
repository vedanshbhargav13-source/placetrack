import pool from "../db.js";

// 1. Fetch only companies belonging to the authenticated user
export async function listCompanies(userId) {
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
        WHERE user_id = $1
        ORDER BY id DESC
    `, [userId]);

    return result.rows;
}


// 2. Create a company owned by the authenticated user
export async function createCompany({
    name,
    website,
    location,
    notes
}, userId) {
    const result = await pool.query(
        `INSERT INTO companies
            (company_name, website, location, notes, user_id)
         VALUES ($1, $2, $3, $4, $5)
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
            userId
        ]
    );

    return result.rows[0];
}


// 3. Fetch a specific company only if it belongs to the user
export async function getCompanyById(id, userId) {
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
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    return result.rows[0] ?? null;
}


// 4. Update a company only if it belongs to the user
export async function updateCompany(
    id,
    { name, website, location, notes },
    userId
) {
    const result = await pool.query(
        `UPDATE companies
         SET company_name = $1,
             website = $2,
             location = $3,
             notes = $4
         WHERE id = $5 AND user_id = $6
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
            id,
            userId
        ]
    );

    return result.rows[0] ?? null;
}


// 5. Delete a company only if it belongs to the user
export async function deleteCompany(id, userId) {
    const result = await pool.query(
        `DELETE FROM companies
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rows[0] ?? null;
}