
import pool from "../db.js";

// GET dashboard statistics for a specific user
export async function getDashboardStats(userId) {
    const result = await pool.query(
        `
        SELECT
            COUNT(*)::INTEGER AS "totalApplications",

            COUNT(*) FILTER (
                WHERE status NOT IN ('Selected', 'Rejected')
            )::INTEGER AS "activeApplications",

            COUNT(*) FILTER (
                WHERE status = 'Selected'
            )::INTEGER AS "offers",

            COUNT(*) FILTER (
                WHERE status = 'Rejected'
            )::INTEGER AS "rejected",

            COALESCE(
                (
                    SELECT COUNT(*)::INTEGER
                    FROM oa_interviews oi
                    JOIN applications a
                        ON a.id = oi.application_id
                    WHERE a.user_id = $1
                    AND oi.round_type ILIKE '%assessment%'
                    AND oi.status IN ('Pending', 'Scheduled')
                    AND oi.scheduled_at >= CURRENT_TIMESTAMP
                ),
                0
            ) AS "oas",

            COALESCE(
                (
                    SELECT COUNT(*)::INTEGER
                    FROM oa_interviews oi
                    JOIN applications a
                        ON a.id = oi.application_id
                    WHERE a.user_id = $1
                    AND oi.round_type NOT ILIKE '%assessment%'
                    AND oi.status IN ('Pending', 'Scheduled')
                    AND oi.scheduled_at >= CURRENT_TIMESTAMP
                ),
                0
            ) AS "interviews"

        FROM applications
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
}
