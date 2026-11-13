import pool from "../db.js";

export async function getCalendarItems(userId) {
    const result = await pool.query(`
        SELECT * FROM (
            SELECT a.id::text || '-deadline' AS uid, 'Application deadline · ' || c.company_name || ' — ' || j.job_title AS title,
                   j.deadline::timestamp AT TIME ZONE 'UTC' AS starts_at, NULL::text AS description
            FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND j.deadline IS NOT NULL AND a.status NOT IN ('Selected','Rejected')
            UNION ALL
            SELECT oi.id::text || '-round', c.company_name || ' · ' || oi.round_type || ' — ' || j.job_title,
                   oi.scheduled_at, oi.notes
            FROM oa_interviews oi JOIN applications a ON a.id = oi.application_id
            JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND oi.scheduled_at IS NOT NULL AND oi.status IN ('Pending','Scheduled')
            UNION ALL
            SELECT act.id::text || '-action', act.title || ' · ' || c.company_name || ' — ' || j.job_title,
                   act.due_at, COALESCE(act.details, act.waiting_on)
            FROM application_actions act JOIN applications a ON a.id = act.application_id
            JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND act.due_at IS NOT NULL AND act.state <> 'done'
            UNION ALL
            SELECT a.id::text || '-followup', 'Follow up · ' || c.company_name || ' — ' || j.job_title,
                   a.follow_up_due_at, a.waiting_on
            FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = $1 AND a.follow_up_due_at IS NOT NULL AND a.status NOT IN ('Selected','Rejected')
        ) events
        ORDER BY starts_at
    `, [userId]);
    return result.rows;
}

const escapeText = value => String(value ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const formatDate = value => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
function foldLine(line) {
    const parts = [];
    let current = "";
    for (const character of line) {
        if (Buffer.byteLength(current + character, "utf8") > (parts.length ? 74 : 75)) {
            parts.push(current);
            current = ` ${character}`;
        } else current += character;
    }
    parts.push(current);
    return parts.join("\r\n");
}

export function createCalendar(events) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PlaceTrack//Student Planner//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    for (const event of events) {
        const date = formatDate(event.starts_at);
        lines.push("BEGIN:VEVENT", `UID:${escapeText(event.uid)}@placetrack`, `DTSTAMP:${formatDate(new Date())}`, `DTSTART:${date}`, `DTEND:${formatDate(new Date(new Date(event.starts_at).getTime() + 30 * 60_000))}`, `SUMMARY:${escapeText(event.title)}`);
        if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
        lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR", "");
    return lines.map(foldLine).join("\r\n");
}
