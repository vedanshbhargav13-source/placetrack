import pool from "../db.js";

export async function captureOpportunity(userId, data) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (data.apply_url) {
            const existing = await client.query(`
                SELECT a.id AS application_id, a.job_id, c.id AS company_id
                FROM applications a
                JOIN jobs j ON j.id = a.job_id
                JOIN companies c ON c.id = j.company_id
                WHERE a.user_id = $1 AND j.apply_url = $2
                LIMIT 1 FOR UPDATE OF a
            `, [userId, data.apply_url]);
            if (existing.rows[0]) {
                await client.query("COMMIT");
                return { ...existing.rows[0], already_saved: true };
            }
        }
        let company = await client.query(`SELECT id FROM companies
            WHERE user_id = $1 AND LOWER(company_name) = LOWER($2)
            ORDER BY id LIMIT 1 FOR UPDATE`, [userId, data.company]);
        if (!company.rows[0]) {
            company = await client.query(`
                INSERT INTO companies (company_name, location, user_id)
                VALUES ($1, $2, $3) RETURNING id
            `, [data.company, data.location ?? null, userId]);
        }
        const job = await client.query(`
            INSERT INTO jobs (company_id, job_title, source, source_context, apply_url, location, work_type, deadline)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        `, [company.rows[0].id, data.role, data.source, data.context ?? null, data.apply_url ?? null,
            data.location ?? null, data.work_type ?? null, data.deadline ?? null]);
        const application = await client.query(`
            INSERT INTO applications (user_id, job_id, status, notes, waiting_on)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [userId, job.rows[0].id, data.status, data.note ?? null,
            data.status === "Saved" && !data.apply_url ? "Application link" : null]);
        await client.query(`
            INSERT INTO application_events (application_id, status, from_status, to_status, note, event_type)
            VALUES ($1, $2, NULL, $2, $3, 'created')
        `, [application.rows[0].id, data.status, data.context ?? "Opportunity captured"]);
        if (data.status === "Saved") {
            await client.query(`
                INSERT INTO application_actions (application_id, title, details, state, waiting_on, due_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [application.rows[0].id,
                data.apply_url ? "Review opportunity and apply" : "Check for the application link",
                data.context ?? null, data.apply_url ? "open" : "waiting",
                data.apply_url ? null : "Application link",
                data.deadline ? `${data.deadline}T09:00:00Z` : null]);
        }
        await client.query("COMMIT");
        return { ...application.rows[0], company_id: company.rows[0].id, job_id: job.rows[0].id };
    } catch (error) {
        try { await client.query("ROLLBACK"); } catch (rollbackError) { console.error("Transaction rollback failed:", rollbackError); }
        throw error;
    } finally {
        client.release();
    }
}
