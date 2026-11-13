import pool from "../db.js";
import AppError from "../utils/AppError.js";

// 1. CREATE an interview/OA round
export async function createInterview(userId, applicationId, data) {
    const applicationResult = await pool.query(
        `SELECT id
         FROM applications
         WHERE id = $1 AND user_id = $2`,
        [applicationId, userId]
    );

    if (applicationResult.rows.length === 0) {
        throw new AppError("Application not found", 404);
    }

    const result = await pool.query(
        `INSERT INTO oa_interviews (
            application_id,
            round_type,
            scheduled_at,
            status,
            notes,
            score,
            topics,
            questions,
            result,
            debrief,
            feedback
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
            applicationId,
            data.round_type,
            data.scheduled_at ?? null,
            data.status ?? "Pending",
            data.notes ?? null,
            data.score ?? null,
            data.topics ? JSON.stringify(data.topics) : null,
            data.questions ? JSON.stringify(data.questions) : null,
            data.result ?? null,
            data.debrief ?? null,
            data.feedback ?? null
        ]
    );

    return result.rows[0];
}


// 2. GET all interviews for an application
export async function getInterviewsByApplicationId(userId, applicationId) {
    const result = await pool.query(
        `SELECT oi.*
         FROM oa_interviews oi
         JOIN applications a
         ON a.id = oi.application_id
         WHERE oi.application_id = $1
         AND a.user_id = $2
         ORDER BY oi.created_at DESC`,
        [applicationId, userId]
    );

    return result.rows;
}


// 3. UPDATE an interview
export async function updateInterview(
    userId,
    applicationId,
    interviewId,
    data
) {
    const result = await pool.query(
        `UPDATE oa_interviews oi
         SET
            round_type = COALESCE($1, oi.round_type),
            scheduled_at = COALESCE($2, oi.scheduled_at),
            status = COALESCE($3, oi.status),
            notes = COALESCE($4, oi.notes),
            score = COALESCE($5, oi.score),
            topics = COALESCE($6, oi.topics),
            questions = COALESCE($7, oi.questions),
            result = COALESCE($8, oi.result),
            debrief = COALESCE($9, oi.debrief),
            feedback = COALESCE($10, oi.feedback)
         FROM applications a
         WHERE oi.application_id = a.id
         AND oi.id = $11
         AND oi.application_id = $12
         AND a.user_id = $13
         RETURNING oi.*`,
        [
            data.round_type ?? null,
            data.scheduled_at ?? null,
            data.status ?? null,
            data.notes ?? null,
            data.score ?? null,
            data.topics ? JSON.stringify(data.topics) : null,
data.questions ? JSON.stringify(data.questions) : null,
            data.result ?? null,
            data.debrief ?? null,
            data.feedback ?? null,
            interviewId,
            applicationId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}


// 4. DELETE an interview
export async function deleteInterview(
    userId,
    applicationId,
    interviewId
) {
    const result = await pool.query(
        `DELETE FROM oa_interviews oi
         USING applications a
         WHERE oi.application_id = a.id
         AND oi.id = $1
         AND oi.application_id = $2
         AND a.user_id = $3
         RETURNING oi.id`,
        [interviewId, applicationId, userId]
    );

    return result.rows[0] ?? null;
}
