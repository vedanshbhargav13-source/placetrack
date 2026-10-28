import pool from "../db.js";

export async function getApplicationsByUserId(userId) {
    const result = await pool.query(
        `
        SELECT
            a.id AS application_id,
            a.status,
            a.applied_at,
            a.updated_at,
            j.id AS job_id,
            j.job_title,
            j.job_type,
            c.id AS company_id,
            c.company_name,
            c.website,
            c.location
        FROM applications a
        JOIN jobs j
            ON a.job_id = j.id
        JOIN companies c
            ON j.company_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.applied_at DESC
        `,
        [userId]
    );

    return result.rows;
}