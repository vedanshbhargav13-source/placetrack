import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";
import app from "../src/index.js";
import pool from "../src/db.js";
import { captureOpportunity } from "../src/services/opportunities.service.js";
import { createAction, listActions } from "../src/services/actions.service.js";
import { updateJob } from "../src/services/jobs.service.js";
import { updateApplicationStatus, getApplicationsByUserId } from "../src/services/applications.service.js";
import { createInterview, getInterviewsByApplicationId, updateInterview } from "../src/services/interviews.service.js";
import { createQuestion, listQuestions, updateQuestion, deleteQuestion } from "../src/services/questions.service.js";
import { getPreferences, savePreferences, compareApplications } from "../src/services/compare.service.js";
import { getPlanner, getFollowUps } from "../src/services/planner.service.js";
import { scheduleFollowUp } from "../src/services/followups.service.js";
import { getCalendarItems, createCalendar } from "../src/services/calendar.service.js";
import { getDashboardStats } from "../src/services/dashboard.service.js";
import { upsertProfile } from "../src/services/profile.service.js";

test("PostgreSQL-backed PlaceTrack flows enforce ownership and persist feature data", async () => {
    const client = await pool.connect();
    let userIds = [];
    let httpServer;
    try {
        const first = await client.query(`INSERT INTO users (name, email, password_hash)
            VALUES ('PlaceTrack integration', $1, 'integration-test-only') RETURNING id`, [`pt-test-${randomUUID()}@example.invalid`]);
        userIds = [first.rows[0].id];
        const other = await client.query(`INSERT INTO users (name, email, password_hash)
            VALUES ('PlaceTrack integration other', $1, 'integration-test-only') RETURNING id`, [`pt-test-${randomUUID()}@example.invalid`]);
        const userId = first.rows[0].id;
        const otherUserId = other.rows[0].id;
        userIds.push(otherUserId);

        httpServer = createServer(app);
        await new Promise((resolve, reject) => {
            httpServer.once("error", reject);
            httpServer.listen(0, "127.0.0.1", resolve);
        });
        const baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
        const token = jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn: "5m" });
        assert.equal((await fetch(`${baseUrl}/api/health`)).status, 200);
        assert.equal((await fetch(`${baseUrl}/api/dashboard/planner`)).status, 401);

        const captured = await captureOpportunity(userId, {
            company: "PlaceTrack Integration Test Co", role: "Software engineering intern",
            source: "college", context: "Shared in the placement group", status: "Saved",
            deadline: "2026-12-01", note: "Integration note"
        });
        const secondCapture = await captureOpportunity(userId, {
            company: "PlaceTrack Integration Test Co", role: "Frontend intern", source: "other",
            status: "Applied", deadline: "2026-12-15", context: "Company careers page"
        });
        assert.equal(captured.company_id, secondCapture.company_id, "captures for one user reuse their company record");

        const apiCaptureResponse = await fetch(`${baseUrl}/api/opportunities`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ company: "PlaceTrack API Integration Co", role: "API test intern", source: "other", status: "Saved", deadline: "2026-12-20", context: "Created through the HTTP API" })
        });
        assert.equal(apiCaptureResponse.status, 201);
        const apiCapture = (await apiCaptureResponse.json()).data;
        const invalidCaptureResponse = await fetch(`${baseUrl}/api/opportunities`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ company: "Invalid URL Test", role: "Engineer", apply_url: "javascript:alert(1)" })
        });
        assert.equal(invalidCaptureResponse.status, 400);
        const apiActionResponse = await fetch(`${baseUrl}/api/applications/${apiCapture.id}/actions`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Review the saved opportunity", state: "open" })
        });
        assert.equal(apiActionResponse.status, 201);

        await upsertProfile(userId, { college: "Test University", branch: "Software Engineering", graduation_year: 2027, cgpa: 8.2, skills: ["React", "SQL"] });
        const savedPreferences = await savePreferences(userId, {
            priority_weights: { skills: 50, role: 20, work_type: 10, location: 10, stipend: 5, deadline: 5 },
            preferred_work_types: ["remote"], preferred_locations: ["Remote"]
        });
        assert.equal(savedPreferences.priority_weights.skills, 50);
        assert.equal((await getPreferences(userId)).priority_weights.skills, 50);

        const linkedAction = await createAction(userId, captured.id, {
            title: "Review the role before applying", kind: "prep", state: "open", deadline_offset_days: -2
        });
        assert.equal(new Date(linkedAction.due_at).toISOString().slice(0, 10), "2026-11-29");

        const changedJob = await updateJob(userId, captured.job_id, {
            company_id: captured.company_id, title: "Software engineering intern", jd_text: "React and SQL",
            source: "college", source_context: "Shared in the placement group", apply_url: null,
            location: "Remote", work_type: "remote", stipend: 40000, deadline: "2026-12-10"
        });
        assert.equal(changedJob.deadline.toISOString?.().slice(0, 10) ?? String(changedJob.deadline).slice(0, 10), "2026-12-10");
        const actions = await listActions(userId, captured.id);
        const rescheduled = actions.find(action => action.id === linkedAction.id);
        assert.equal(new Date(rescheduled.due_at).toISOString().slice(0, 10), "2026-12-08");

        await updateApplicationStatus(userId, captured.id, "Applied", "Submitted the application");
        await scheduleFollowUp(userId, captured.id, {
            follow_up_due_at: "2026-12-02T10:00:00.000Z", last_response_at: "2026-11-12T10:00:00.000Z", waiting_on: "Recruiter response"
        });
        const followUps = await getFollowUps(userId);
        assert.equal(followUps.length, 1);
        assert.equal(followUps[0].waiting_on, "Recruiter response");

        const round = await createInterview(userId, captured.id, {
            round_type: "Technical interview", scheduled_at: "2026-12-03T10:00:00.000Z", status: "Scheduled", notes: "Prepare the portfolio"
        });
        await updateInterview(userId, captured.id, round.id, { debrief: "Discussed React state", feedback: "Send a follow-up note" });
        const rounds = await getInterviewsByApplicationId(userId, captured.id);
        assert.equal(rounds.length, 1);
        assert.equal(rounds[0].debrief, "Discussed React state");

        const question = await createQuestion(userId, {
            application_id: captured.id, round_id: round.id, question: "How would you model an application timeline?",
            topic: "System design", difficulty: "medium", notes: "Use event history"
        });
        await updateQuestion(userId, question.id, { notes: "Use append-only event history" });
        assert.equal((await listQuestions(userId, { q: "timeline", topic: "" })).length, 1);

        const compared = await compareApplications(userId, [captured.id, secondCapture.id]);
        assert.equal(compared.length, 2);
        assert.ok(compared.every(row => Number.isFinite(row.priority_score)));
        const apps = await getApplicationsByUserId(userId, { page: 1, limit: 50, sort: "applied_at", order: "desc" });
        assert.equal(apps.pagination.total, 3);
        assert.ok(apps.data.some(row => row.source_context === "Shared in the placement group"));
        assert.equal((await getApplicationsByUserId(otherUserId, { page: 1, limit: 50, sort: "applied_at", order: "desc" })).pagination.total, 0);
        assert.equal((await listActions(otherUserId, captured.id)).length, 0);
        assert.equal((await getInterviewsByApplicationId(otherUserId, captured.id)).length, 0);

        const planner = await getPlanner(userId);
        assert.ok(planner.some(item => item.item_type === "deadline"));
        assert.ok(planner.some(item => item.item_type === "round"));
        assert.ok(planner.some(item => item.item_type === "action"));
        const stats = await getDashboardStats(userId);
        assert.equal(stats.totalApplications, 3);
        const plannerResponse = await fetch(`${baseUrl}/api/dashboard/planner`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(plannerResponse.status, 200);
        assert.ok((await plannerResponse.json()).data.length >= planner.length);
        const applicationsResponse = await fetch(`${baseUrl}/api/applications?limit=50&page=1`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(applicationsResponse.status, 200);
        assert.equal((await applicationsResponse.json()).pagination.total, 3);
        const savedStageResponse = await fetch(`${baseUrl}/api/applications?limit=50&page=1&status=Saved`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(savedStageResponse.status, 200);
        assert.equal((await savedStageResponse.json()).pagination.total, 1);
        const typoSearchResponse = await fetch(`${baseUrl}/api/applications?limit=50&page=1&q=API%20tset%20intern`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(typoSearchResponse.status, 200);
        assert.equal((await typoSearchResponse.json()).pagination.total, 1);
        const dashboardStatsResponse = await fetch(`${baseUrl}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(dashboardStatsResponse.status, 200);
        assert.equal((await dashboardStatsResponse.json()).data.totalApplications, 3);
        const calendarResponse = await fetch(`${baseUrl}/api/calendar.ics`, { headers: { Authorization: `Bearer ${token}` } });
        assert.equal(calendarResponse.status, 200);
        assert.match(calendarResponse.headers.get("content-type"), /text\/calendar/);
        const events = await getCalendarItems(userId);
        const ics = createCalendar(events);
        assert.match(ics, /BEGIN:VCALENDAR/);
        assert.match(ics, /Follow up/);
        await deleteQuestion(userId, question.id);
    } finally {
        try {
            if (httpServer?.listening) await new Promise(resolve => httpServer.close(resolve));
            if (userIds.length) {
                await client.query("BEGIN");
                try {
                    await client.query("DELETE FROM applications WHERE user_id = ANY($1::integer[])", [userIds]);
                    await client.query("DELETE FROM jobs WHERE company_id IN (SELECT id FROM companies WHERE user_id = ANY($1::integer[]))", [userIds]);
                    await client.query("DELETE FROM companies WHERE user_id = ANY($1::integer[])", [userIds]);
                    await client.query("DELETE FROM profiles WHERE user_id = ANY($1::integer[])", [userIds]);
                    await client.query("DELETE FROM user_preferences WHERE user_id = ANY($1::integer[])", [userIds]);
                    await client.query("DELETE FROM users WHERE id = ANY($1::integer[])", [userIds]);
                    await client.query("COMMIT");
                    const leftovers = await client.query("SELECT COUNT(*)::integer AS count FROM users WHERE id = ANY($1::integer[])", [userIds]);
                    assert.equal(leftovers.rows[0].count, 0, "temporary test accounts are cleaned up");
                } catch (cleanupError) {
                    await client.query("ROLLBACK");
                    throw cleanupError;
                }
            }
        } finally {
            client.release();
            await pool.end();
        }
    }
});
