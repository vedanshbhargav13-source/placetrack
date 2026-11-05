
import pool from "../db.js";

export async function getTodayData(userId) {
    const result = await pool.query(
        `
        SELECT
            COALESCE(
                (
                    SELECT json_agg(deadlines)
                    FROM (
                        SELECT
                            a.id AS application_id,
                            j.job_title,
                            c.company_name,
                            j.deadline
                        FROM applications a
                        JOIN jobs j ON j.id = a.job_id
                        JOIN companies c ON c.id = j.company_id
                        WHERE a.user_id = $1
                        AND j.deadline BETWEEN CURRENT_DATE
                        AND CURRENT_DATE + 7
                        AND a.status NOT IN ('Selected', 'Rejected')
                        ORDER BY j.deadline ASC
                    ) deadlines
                ),
                '[]'::json
            ) AS upcoming_deadlines,

            COALESCE(
                (
                    SELECT json_agg(interviews)
                    FROM (
                        SELECT
                            oi.id AS interview_id,
                            oi.application_id,
                            oi.round_type,
                            oi.scheduled_at,
                            oi.status,
                            j.job_title,
                            c.company_name
                        FROM oa_interviews oi
                        JOIN applications a
                            ON a.id = oi.application_id
                        JOIN jobs j ON j.id = a.job_id
                        JOIN companies c ON c.id = j.company_id
                        WHERE a.user_id = $1
                        AND oi.scheduled_at >= CURRENT_TIMESTAMP
                        AND oi.scheduled_at < CURRENT_TIMESTAMP
                            + INTERVAL '7 days'
                        AND oi.status = 'Scheduled'
                        ORDER BY oi.scheduled_at ASC
                    ) interviews
                ),
                '[]'::json
            ) AS upcoming_interviews,

            COALESCE(
                (
                    SELECT json_agg(followups)
                    FROM (
                        SELECT
                            a.id AS application_id,
                            a.status,
                            a.updated_at,
                            j.job_title,
                            c.company_name
                        FROM applications a
                        JOIN jobs j ON j.id = a.job_id
                        JOIN companies c ON c.id = j.company_id
                        WHERE a.user_id = $1
                        AND a.updated_at <= NOW() - INTERVAL '7 days'
                        AND a.status NOT IN ('Selected', 'Rejected')
                        ORDER BY a.updated_at ASC
                    ) followups
                ),
                '[]'::json
            ) AS followups
        `,
        [userId]
    );

    return result.rows[0];
}
