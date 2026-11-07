
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


// 2. Get jobs with search, filtering, sorting and pagination
export async function getJobs(userId, filters) {
    const conditions = ["c.user_id = $1"];
    const values = [userId];

    // Search by job title or company name
    if (filters.q) {
        values.push(`%${filters.q}%`);

        conditions.push(
            `(j.job_title ILIKE $${values.length}
              OR c.company_name ILIKE $${values.length})`
        );
    }

    // Filter by company
    if (filters.company_id) {
        values.push(filters.company_id);
        conditions.push(`j.company_id = $${values.length}`);
    }

    // Filter by work type
    if (filters.work_type) {
        values.push(filters.work_type);
        conditions.push(`j.work_type = $${values.length}`);
    }

    // Filter by deadline
    if (filters.deadline_before) {
        values.push(filters.deadline_before);
        conditions.push(`j.deadline <= $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    // Whitelist allowed sorting columns
    const sortColumns = {
        deadline: "j.deadline",
        created_at: "j.created_at"
    };

    const sortColumn = sortColumns[filters.sort];
    const sortOrder = filters.order.toUpperCase();

    // Calculate pagination
    const offset = (filters.page - 1) * filters.limit;

    values.push(filters.limit);
    const limitPosition = values.length;

    values.push(offset);
    const offsetPosition = values.length;

    // Fetch paginated jobs
    const result = await pool.query(
        `SELECT
            j.*,
            c.company_name
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE ${whereClause}
         ORDER BY ${sortColumn} ${sortOrder} NULLS LAST, j.id DESC
         LIMIT $${limitPosition}
         OFFSET $${offsetPosition}`,
        values
    );

    // Count all matching jobs before pagination
    const countResult = await pool.query(
        `SELECT COUNT(*)::INTEGER AS total
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE ${whereClause}`,
        values.slice(0, -2)
    );

    const total = countResult.rows[0].total;

    return {
        data: result.rows,
        pagination: {
            total,
            page: filters.page,
            limit: filters.limit,
            totalPages: Math.ceil(total / filters.limit)
        }
    };
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
