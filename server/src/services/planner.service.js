import pool from "../db.js";

export async function getPlanner(userId) {
    const result = await pool.query(`
        SELECT * FROM (
            SELECT 'deadline'::text AS item_type, a.id AS application_id, NULL::integer AS item_id,
                   c.company_name, j.job_title AS title, j.deadline::timestamp AT TIME ZONE 'UTC' AS due_at,
                   a.status, NULL::text AS state, NULL::text AS detail
            FROM applications a JOIN jobs j ON j.id = a.job_id
            JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND j.deadline IS NOT NULL AND a.status NOT IN ('Selected','Rejected')
            UNION ALL
            SELECT 'round', a.id, oi.id, c.company_name,
                   oi.round_type || COALESCE(' · ' || j.job_title, ''), oi.scheduled_at,
                   a.status, oi.status, oi.notes
            FROM oa_interviews oi JOIN applications a ON a.id = oi.application_id
            JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND oi.scheduled_at IS NOT NULL AND oi.status IN ('Pending','Scheduled')
            UNION ALL
            SELECT 'action', a.id, act.id, c.company_name, act.title, act.due_at,
                   a.status, act.state, COALESCE(act.waiting_on, act.details)
            FROM application_actions act JOIN applications a ON a.id = act.application_id
            JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND act.state <> 'done'
        ) planner_items
        ORDER BY due_at NULLS LAST, company_name
    `, [userId]);

    return result.rows;
}

export async function getFollowUps(userId) {
    const result = await pool.query(`
        SELECT a.id AS application_id, a.status, a.follow_up_due_at, a.last_response_at,
               a.waiting_on, j.job_title, c.company_name,
               GREATEST(0, CURRENT_DATE - COALESCE(a.last_response_at::date, a.applied_at::date))::integer AS days_waiting
        FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
        WHERE a.user_id = $1 AND a.status NOT IN ('Selected','Rejected')
          AND (a.follow_up_due_at IS NOT NULL OR a.last_response_at IS NOT NULL)
        ORDER BY a.follow_up_due_at NULLS LAST, a.last_response_at NULLS FIRST
    `, [userId]);
    return result.rows;
}
