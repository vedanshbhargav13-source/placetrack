import pool from "../db.js";
import AppError from "../utils/AppError.js";

const fields = ["title", "details", "kind", "state", "due_at", "deadline_offset_days", "waiting_on"];

export async function listActions(userId, applicationId) {
    const result = await pool.query(`
        SELECT act.* FROM application_actions act
        JOIN applications a ON a.id = act.application_id
        WHERE a.id = $1 AND a.user_id = $2
        ORDER BY act.due_at NULLS LAST, act.created_at DESC
    `, [applicationId, userId]);
    return result.rows;
}

export async function createAction(userId, applicationId, data) {
    const result = await pool.query(`
        INSERT INTO application_actions
            (application_id, title, details, kind, state, due_at, deadline_offset_days, waiting_on, completed_at)
        SELECT a.id, $3, $4, $5, $6,
               CASE WHEN $8::integer IS NOT NULL AND j.deadline IS NOT NULL
                    THEN ((j.deadline + $8::integer)::timestamp AT TIME ZONE 'UTC') ELSE $7::timestamptz END,
               $8, $9, CASE WHEN $6::varchar = 'done' THEN CURRENT_TIMESTAMP ELSE NULL END
        FROM applications a JOIN jobs j ON j.id = a.job_id
        WHERE a.id = $1 AND a.user_id = $2
        RETURNING *
    `, [applicationId, userId, data.title, data.details ?? null, data.kind, data.state,
        data.due_at ?? null, data.deadline_offset_days ?? null, data.waiting_on ?? null]);
    if (!result.rows[0]) throw new AppError("Application not found", 404);
    return result.rows[0];
}

export async function updateAction(userId, applicationId, actionId, data) {
    const values = [applicationId, userId, actionId];
    const updates = [];
    for (const key of fields) {
        if (Object.hasOwn(data, key)) {
            values.push(data[key]);
            updates.push(`${key} = $${values.length}`);
        }
    }
    if (Object.hasOwn(data, "state")) {
        values.push(data.state === "done");
        updates.push(`completed_at = CASE WHEN $${values.length} THEN CURRENT_TIMESTAMP ELSE NULL END`);
    }
    if (!updates.length) throw new AppError("No action fields supplied", 400);
    updates.push("updated_at = CURRENT_TIMESTAMP");
    const result = await pool.query(`
        UPDATE application_actions act SET ${updates.join(", ")}
        FROM applications a
        WHERE act.application_id = a.id AND a.user_id = $2
          AND act.application_id = $1 AND act.id = $3
        RETURNING act.*
    `, values);
    if (!result.rows[0]) throw new AppError("Action not found", 404);
    return result.rows[0];
}

export async function deleteAction(userId, applicationId, actionId) {
    const result = await pool.query(`
        DELETE FROM application_actions act USING applications a
        WHERE act.application_id = a.id AND a.user_id = $1
          AND act.application_id = $2 AND act.id = $3 RETURNING act.id
    `, [userId, applicationId, actionId]);
    if (!result.rows[0]) throw new AppError("Action not found", 404);
    return result.rows[0];
}
