import pool from "../db.js";

export async function getProfile(userId) {
    const result = await pool.query(
        `SELECT *
         FROM profiles
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0] ?? null;
}

export async function upsertProfile(userId, data) {
    const {
        college,
        branch,
        graduation_year,
        cgpa,
        skills,
        github_url,
        linkedin_url
    } = data;

    const result = await pool.query(
        `INSERT INTO profiles
            (user_id, college, branch, graduation_year, cgpa,
             skills, github_url, linkedin_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id)
         DO UPDATE SET
            college = EXCLUDED.college,
            branch = EXCLUDED.branch,
            graduation_year = EXCLUDED.graduation_year,
            cgpa = EXCLUDED.cgpa,
            skills = EXCLUDED.skills,
            github_url = EXCLUDED.github_url,
            linkedin_url = EXCLUDED.linkedin_url,
            updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
            userId,
            college ?? null,
            branch ?? null,
            graduation_year ?? null,
            cgpa ?? null,
            skills ?? [],
            github_url ?? null,
            linkedin_url ?? null
        ]
    );

    return result.rows[0];
}