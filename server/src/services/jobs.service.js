import pool from "../db.js";

// 1. Create a job after verifying company ownership
export async function createJob(userId, data) {
    const result = await pool.query(
        `INSERT INTO jobs (
            company_id,
            job_title,
            jd_text,
            source,
            apply_url,
            location,
            work_type,
            stipend,
            deadline
        )
        SELECT
            c.id, $3, $4, $5, $6, $7, $8, $9, $10
        FROM companies c
        WHERE c.id = $2 AND c.user_id = $1
        RETURNING *`,
        [
            userId,
            data.company_id,
            data.title,
            data.jd_text ?? null,
            data.source ?? null,
            data.apply_url ?? null,
            data.location ?? null,
            data.work_type ?? null,
            data.stipend ?? null,
            data.deadline ?? null
        ]
    );

    return result.rows[0] ?? null;
}


// 2. Get all jobs belonging to the user
export async function getJobs(userId) {
    const result = await pool.query(
        `SELECT
            j.*,
            c.company_name
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE c.user_id = $1
         ORDER BY j.created_at DESC`,
        [userId]
    );

    return result.rows;
}


// 3. Get one job belonging to the user
export async function getJobById(userId, jobId) {
    const result = await pool.query(
        `SELECT
            j.*,
            c.company_name
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE j.id = $2 AND c.user_id = $1`,
        [userId, jobId]
    );

    return result.rows[0] ?? null;
}


// 4. Update a job belonging to the user
export async function updateJob(userId, jobId, data) {
    const result = await pool.query(
        `UPDATE jobs j
         SET company_id = $1,
             job_title = $2,
             jd_text = $3,
             source = $4,
             apply_url = $5,
             location = $6,
             work_type = $7,
             stipend = $8,
             deadline = $9
         FROM companies c
         WHERE j.id = $10
           AND c.id = j.company_id
           AND c.user_id = $11
           AND EXISTS (
               SELECT 1
               FROM companies target
               WHERE target.id = $1
                 AND target.user_id = $11
           )
         RETURNING j.*`,
        [
            data.company_id,
            data.title,
            data.jd_text ?? null,
            data.source ?? null,
            data.apply_url ?? null,
            data.location ?? null,
            data.work_type ?? null,
            data.stipend ?? null,
            data.deadline ?? null,
            jobId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}


// 5. Delete a job belonging to the user
export async function deleteJob(userId, jobId) {
    const result = await pool.query(
        `DELETE FROM jobs j
         USING companies c
         WHERE j.id = $1
           AND c.id = j.company_id
           AND c.user_id = $2
         RETURNING j.id`,
        [jobId, userId]
    );

    return result.rows[0] ?? null;
}