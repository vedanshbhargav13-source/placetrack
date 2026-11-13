import pool from "../db.js";
import AppError from "../utils/AppError.js";

export async function scheduleFollowUp(userId, applicationId, data) {
    const result = await pool.query(`
        UPDATE applications SET follow_up_due_at = $1,
            last_response_at = COALESCE($2, last_response_at),
            waiting_on = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
        RETURNING id AS application_id, status, follow_up_due_at, last_response_at, waiting_on
    `, [data.follow_up_due_at, data.last_response_at ?? null, data.waiting_on ?? null, applicationId, userId]);
    if (!result.rows[0]) throw new AppError("Application not found", 404);
    return result.rows[0];
}
