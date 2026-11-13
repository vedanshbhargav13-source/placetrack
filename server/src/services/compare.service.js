import pool from "../db.js";
import AppError from "../utils/AppError.js";

export async function getPreferences(userId) {
    const result = await pool.query("SELECT priority_weights, preferred_work_types, preferred_locations FROM user_preferences WHERE user_id = $1", [userId]);
    return result.rows[0] ?? {
        priority_weights: { skills: 30, role: 25, work_type: 15, location: 15, stipend: 10, deadline: 5 },
        preferred_work_types: [], preferred_locations: []
    };
}

export async function savePreferences(userId, data) {
    const result = await pool.query(`
        INSERT INTO user_preferences (user_id, priority_weights, preferred_work_types, preferred_locations)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET priority_weights = EXCLUDED.priority_weights,
            preferred_work_types = EXCLUDED.preferred_work_types,
            preferred_locations = EXCLUDED.preferred_locations,
            updated_at = CURRENT_TIMESTAMP
        RETURNING priority_weights, preferred_work_types, preferred_locations
    `, [userId, JSON.stringify(data.priority_weights), data.preferred_work_types, data.preferred_locations]);
    return result.rows[0];
}

const norm = value => String(value ?? "").toLocaleLowerCase();

export function scoreComparisons(rows, now = new Date()) {
    const stipends = rows.filter(row => row.stipend !== null && row.stipend !== undefined).map(row => Number(row.stipend) || 0);
    const minStipend = Math.min(...stipends), maxStipend = Math.max(...stipends);
    return rows.map(row => {
        const skills = row.profile_skills ?? [];
        const description = norm(row.jd_text);
        const matchedSkills = skills.filter(skill => skill && description.includes(norm(skill)));
        const workTypes = row.preferred_work_types ?? [];
        const locations = row.preferred_locations ?? [];
        const deadlineDate = row.deadline ? String(row.deadline).slice(0, 10).split("-").map(Number) : null;
        const days = deadlineDate ? Math.round((Date.UTC(deadlineDate[0], deadlineDate[1] - 1, deadlineDate[2]) - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86400000) : null;
        const parts = {
            skills: skills.length ? matchedSkills.length / skills.length * 100 : null,
            role: row.profile_branch && norm(row.job_title).includes(norm(row.profile_branch)) ? 100 : (row.profile_branch ? 35 : null),
            work_type: workTypes.length ? (workTypes.includes(row.work_type) ? 100 : 20) : null,
            location: locations.length ? (locations.some(location => norm(row.location).includes(norm(location))) ? 100 : 20) : null,
            stipend: row.stipend === null || row.stipend === undefined ? null : maxStipend === minStipend ? 60 : ((Number(row.stipend) - minStipend) / (maxStipend - minStipend)) * 100,
            deadline: days === null ? null : days < 0 ? 0 : Math.max(0, 100 - days * 2)
        };
        const rawWeights = row.priority_weights ?? { skills: 30, role: 25, work_type: 15, location: 15, stipend: 10, deadline: 5 };
        const entries = Object.entries(parts).filter(([, value]) => value !== null);
        const totalWeight = entries.reduce((sum, [key]) => sum + Number(rawWeights[key] ?? 0), 0) || 1;
        const score = Math.round(entries.reduce((sum, [key, value]) => sum + value * Number(rawWeights[key] ?? 0), 0) / totalWeight);
        return { ...row, priority_score: score, matched_skills: matchedSkills, score_breakdown: parts };
    }).sort((a, b) => b.priority_score - a.priority_score);
}

export async function compareApplications(userId, ids) {
    if (ids.length < 2 || ids.length > 4) throw new AppError("Choose between 2 and 4 applications to compare", 400);
    const result = await pool.query(`
        SELECT a.id AS application_id, a.status, a.applied_at, j.id AS job_id, j.job_title,
               j.jd_text, j.deadline, j.apply_url, j.location, j.work_type, j.stipend,
               c.company_name, p.skills AS profile_skills, p.branch AS profile_branch,
               pref.priority_weights, pref.preferred_work_types, pref.preferred_locations
        FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
        LEFT JOIN profiles p ON p.user_id = a.user_id LEFT JOIN user_preferences pref ON pref.user_id = a.user_id
        WHERE a.user_id = $1 AND a.id = ANY($2::integer[])
    `, [userId, ids]);
    if (result.rows.length !== ids.length) throw new AppError("One or more applications were not found", 404);
    return scoreComparisons(result.rows);
}
