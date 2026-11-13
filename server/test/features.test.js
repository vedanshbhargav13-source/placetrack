import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { opportunitySchema } from "../src/schemas/opportunity.schema.js";
import { actionSchema } from "../src/schemas/action.schema.js";
import { interviewSchema } from "../src/schemas/interview.schema.js";
import { questionSchema } from "../src/schemas/question.schema.js";
import { preferencesSchema } from "../src/schemas/preferences.schema.js";
import { applicationEditSchema } from "../src/schemas/applicationEdit.schema.js";
import { applicationStatusSchema } from "../src/schemas/applicationStatus.schema.js";
import { createCalendar } from "../src/services/calendar.service.js";
import { scoreComparisons } from "../src/services/compare.service.js";
import { resetDiscoveryCache, searchListings } from "../src/services/discovery.service.js";
import { matchesOpportunitySearch } from "../../client/src/search.js";

test("opportunity capture validates required details and optional links", () => {
    const valid = opportunitySchema.safeParse({ company: "Acme", role: "Design intern", source: "college" });
    assert.equal(valid.success, true);
    assert.equal(opportunitySchema.safeParse({ company: " ", role: "x" }).success, false);
    assert.equal(opportunitySchema.safeParse({ company: "Acme", role: "Engineer", apply_url: "javascript:alert(1)" }).success, false);
    assert.equal(opportunitySchema.safeParse({ company: "Acme", role: "Engineer", source: "unknown" }).success, false);
});

test("opportunity search handles partial terms, common typos, multiple words and short queries", () => {
    assert.equal(matchesOpportunitySearch("Amazon software engineer", "Amazno"), true);
    assert.equal(matchesOpportunitySearch("PlaceTrack API test intern", "API tset intern"), true);
    assert.equal(matchesOpportunitySearch("Google design internship", "googl design"), true);
    assert.equal(matchesOpportunitySearch("Google design internship", "go"), true);
    assert.equal(matchesOpportunitySearch("Google design internship", "zzzzzzzz"), false);
    assert.equal(matchesOpportunitySearch("Google design internship", "design backend"), false);
});

test("public opportunity discovery normalizes listings, filters locally, and caches provider requests", async () => {
    resetDiscoveryCache();
    let calls = 0;
    const fetcher = async () => {
        calls++;
        return { ok: true, json: async () => ({ jobs: [
            { id: 1, title: "Frontend Intern", company_name: "Paper Co", url: "https://remotive.com/remote-jobs/design/frontend-intern-1", candidate_required_location: "Worldwide", category: "Design", publication_date: "2026-10-01", description: "<p>Build <b>React</b> interfaces &amp; tools</p>" },
            { id: 2, title: "Data Engineer", company_name: "Northstar", url: "https://remotive.com/remote-jobs/data/data-engineer-2", description: "SQL pipelines" },
            { id: 3, title: "Unsafe result", company_name: "Bad", url: "https://example.org/listing" },
        ] }) };
    };
    const internships = await searchListings("intern", { fetcher, now: () => 1_000 });
    assert.equal(internships.length, 1);
    assert.equal(internships[0].company, "Paper Co");
    assert.equal(internships[0].summary, "Build React interfaces & tools");
    assert.equal(internships[0].url.startsWith("https://remotive.com/"), true);
    const data = await searchListings("data sql", { fetcher, now: () => 2_000 });
    assert.equal(data.length, 1);
    assert.equal(calls, 1);
    resetDiscoveryCache();
});

test("action validation accepts waiting and relative-deadline actions, rejects invalid state", () => {
    assert.equal(actionSchema.safeParse({ title: "Check for DM", state: "waiting", deadline_offset_days: -2 }).success, true);
    assert.equal(actionSchema.safeParse({ title: "Task", state: "unknown" }).success, false);
    assert.equal(actionSchema.safeParse({ title: "Task", deadline_offset_days: 400 }).success, false);
});

test("rounds, debriefs and question-bank entries are bounded and validated", () => {
    assert.equal(interviewSchema.safeParse({ round_type: "Technical", status: "Completed", debrief: "Review graph traversal" }).success, true);
    assert.equal(interviewSchema.safeParse({ round_type: "T", status: "Hired" }).success, false);
    assert.equal(questionSchema.safeParse({ question: "Explain event loop", difficulty: "hard" }).success, true);
    assert.equal(questionSchema.safeParse({ question: "?", difficulty: "expert" }).success, false);
});

test("application edits preserve explicit partial-update semantics", () => {
    assert.equal(applicationEditSchema.safeParse({ notes: "Context" }).success, true);
    assert.equal(applicationEditSchema.safeParse({ follow_up_due_at: null }).success, true);
    assert.equal(applicationEditSchema.safeParse({}).success, false);
    assert.equal(applicationEditSchema.safeParse({ waiting_on: "x".repeat(301) }).success, false);
});

test("application stage transitions validate known stages and notes", () => {
    assert.equal(applicationStatusSchema.safeParse({ status: "Saved", note: "Waiting for the form" }).success, true);
    assert.equal(applicationStatusSchema.safeParse({ status: "Hired" }).success, false);
    assert.equal(applicationStatusSchema.safeParse({ status: "Interview", note: "x".repeat(1001) }).success, false);
});

test("comparison respects personal skill priorities and handles absent details", () => {
    const preferences = { skills: 100, role: 0, work_type: 0, location: 0, stipend: 0, deadline: 0 };
    const rows = [
        { application_id: 1, company_name: "A", job_title: "Intern", jd_text: "React and SQL", profile_skills: ["React", "SQL"], priority_weights: preferences, preferred_work_types: [], preferred_locations: [] },
        { application_id: 2, company_name: "B", job_title: "Intern", jd_text: "Java", profile_skills: ["React", "SQL"], priority_weights: preferences, preferred_work_types: [], preferred_locations: [] },
        { application_id: 3, company_name: "C", job_title: "Intern", jd_text: null, profile_skills: null, priority_weights: null, preferred_work_types: null, preferred_locations: null },
    ];
    const scored = scoreComparisons(rows, new Date("2026-01-01T00:00:00Z"));
    assert.deepEqual(scored.map(item => item.application_id), [1, 2, 3]);
    assert.equal(scored[0].priority_score, 100);
    assert.equal(scored[1].priority_score, 0);
    assert.equal(Number.isFinite(scored[2].priority_score), true);
});

test("calendar export escapes text, emits valid UTC entries and handles an empty planner", () => {
    const empty = createCalendar([]);
    assert.match(empty, /^BEGIN:VCALENDAR\r\n/);
    assert.match(empty, /END:VCALENDAR\r\n$/);
    const calendar = createCalendar([{ uid: "42", title: "Acme, Inc.; Round", description: "Line one\nLine two", starts_at: "2026-02-03T09:00:00.000Z" }]);
    assert.match(calendar, /SUMMARY:Acme\\, Inc\.\\; Round/);
    assert.match(calendar, /DESCRIPTION:Line one\\nLine two/);
    assert.match(calendar, /DTSTART:20260203T090000Z/);
    assert.match(calendar, /DTEND:20260203T093000Z/);
    const longCalendar = createCalendar([{ uid: "long", title: "Interview", description: "🙂".repeat(100), starts_at: "2026-02-03T09:00:00.000Z" }]);
    for (const line of longCalendar.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
});

test("comparison weights require a nonzero total and validate preferences", () => {
    assert.equal(preferencesSchema.safeParse({ priority_weights: { skills: 0, role: 0, work_type: 0, location: 0, stipend: 0, deadline: 0 }, preferred_work_types: [], preferred_locations: [] }).success, false);
    assert.equal(preferencesSchema.safeParse({ priority_weights: { skills: 30, role: 25, work_type: 15, location: 15, stipend: 10, deadline: 5 }, preferred_work_types: ["remote"], preferred_locations: ["Bengaluru"] }).success, true);
});

test("feature migration is transactional, additive, and safe to rerun", async () => {
    const sql = await readFile(new URL("../src/db/migrations/004_student_command_center.sql", import.meta.url), "utf8");
    assert.match(sql, /^BEGIN;/);
    assert.match(sql.trimEnd(), /COMMIT;$/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS application_actions/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS interview_questions/);
    assert.match(sql, /ADD COLUMN IF NOT EXISTS debrief/);
    assert.doesNotMatch(sql, /\b(DROP TABLE|TRUNCATE)\b/i);
});
