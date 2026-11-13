import pool from "../db.js";
import AppError from "../utils/AppError.js";

export async function listQuestions(userId, filters) {
    const values = [userId];
    const where = ["q.user_id = $1"];
    if (filters.q) {
        values.push(`%${filters.q}%`);
        where.push(`(q.question ILIKE $${values.length} OR q.topic ILIKE $${values.length} OR q.company_name ILIKE $${values.length})`);
    }
    if (filters.topic) {
        values.push(`%${filters.topic}%`);
        where.push(`q.topic ILIKE $${values.length}`);
    }
    const result = await pool.query(`SELECT q.* FROM interview_questions q WHERE ${where.join(" AND ")} ORDER BY q.created_at DESC LIMIT 200`, values);
    return result.rows;
}

export async function createQuestion(userId, data) {
    if (data.application_id) {
        const owns = await pool.query("SELECT id FROM applications WHERE id = $1 AND user_id = $2", [data.application_id, userId]);
        if (!owns.rows[0]) throw new AppError("Application not found", 404);
    }
    if (data.round_id) {
        const owns = await pool.query(`SELECT oi.id FROM oa_interviews oi JOIN applications a ON a.id = oi.application_id WHERE oi.id = $1 AND a.user_id = $2 AND ($3::integer IS NULL OR oi.application_id = $3)`, [data.round_id, userId, data.application_id ?? null]);
        if (!owns.rows[0]) throw new AppError("Round not found", 404);
    }
    const result = await pool.query(`
        INSERT INTO interview_questions (user_id, application_id, round_id, company_name, role_title, question, topic, difficulty, notes)
        SELECT $1, $2, $3, COALESCE($4, c.company_name), COALESCE($5, j.job_title), $6, $7, $8, $9
        FROM (SELECT 1) seed
        LEFT JOIN applications a ON a.id = $2 AND a.user_id = $1
        LEFT JOIN jobs j ON j.id = a.job_id LEFT JOIN companies c ON c.id = j.company_id
        RETURNING *
    `, [userId, data.application_id ?? null, data.round_id ?? null, data.company_name ?? null,
        data.role_title ?? null, data.question, data.topic ?? null, data.difficulty ?? null, data.notes ?? null]);
    return result.rows[0];
}

export async function updateQuestion(userId, id, data) {
    const existing = await pool.query(
        "SELECT application_id, round_id FROM interview_questions WHERE user_id = $1 AND id = $2",
        [userId, id]
    );
    if (!existing.rows[0]) throw new AppError("Question not found", 404);
    const applicationId = Object.hasOwn(data, "application_id") ? data.application_id : existing.rows[0].application_id;
    const roundId = Object.hasOwn(data, "round_id") ? data.round_id : existing.rows[0].round_id;
    if (applicationId) {
        const owns = await pool.query("SELECT id FROM applications WHERE id = $1 AND user_id = $2", [applicationId, userId]);
        if (!owns.rows[0]) throw new AppError("Application not found", 404);
    }
    if (roundId) {
        const owns = await pool.query(`SELECT oi.id FROM oa_interviews oi JOIN applications a ON a.id = oi.application_id
            WHERE oi.id = $1 AND a.user_id = $2 AND ($3::integer IS NULL OR oi.application_id = $3)`, [roundId, userId, applicationId ?? null]);
        if (!owns.rows[0]) throw new AppError("Round not found", 404);
    }
    const allowed = ["application_id", "round_id", "company_name", "role_title", "question", "topic", "difficulty", "notes"];
    const values = [userId, id];
    const setters = [];
    for (const field of allowed) if (Object.hasOwn(data, field)) {
        values.push(data[field]);
        setters.push(`${field} = $${values.length}`);
    }
    if (!setters.length) throw new AppError("No question fields supplied", 400);
    setters.push("updated_at = CURRENT_TIMESTAMP");
    const result = await pool.query(`UPDATE interview_questions q SET ${setters.join(", ")} WHERE q.user_id = $1 AND q.id = $2 RETURNING q.*`, values);
    if (!result.rows[0]) throw new AppError("Question not found", 404);
    return result.rows[0];
}

export async function deleteQuestion(userId, id) {
    const result = await pool.query("DELETE FROM interview_questions WHERE user_id = $1 AND id = $2 RETURNING id", [userId, id]);
    if (!result.rows[0]) throw new AppError("Question not found", 404);
}
