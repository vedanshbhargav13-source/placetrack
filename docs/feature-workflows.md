# PlaceTrack — Follow-through Features

## Public opportunity discovery

The Discover view searches Remotive's public remote-job feed, cached for eight hours so queries filter locally instead of repeatedly calling the provider. Each result links to its original Remotive posting and shows the source. Saving a listing creates a private tracker record, a first next step, and a source note. Duplicate listing URLs are recognized. If the feed has no match, the student can open the same search on Google. Listings may be delayed; confirm eligibility and deadlines at the original posting.

The header search is intentionally separate: it searches the signed-in student's complete saved tracker, tolerates common misspellings and applies stage filters across pagination.

## 1. Opportunity capture

Capture a company and role with a source, a short context note, an optional application link, and an optional application deadline. Capturing an opportunity creates the company, job, application, initial event, and (for a saved opportunity) a first next step inside one database transaction. A saved opportunity without an application link starts in a waiting state.

## 2. Deadline ripple planner

Each job has its own application deadline. An application action can be linked to that deadline with an offset in days. For example, an action set to two days before the deadline will move when the deadline changes. The backend updates linked open actions and records a `deadline_changed` event in the application timeline in the same transaction as the job update.

The planner combines application deadlines, upcoming rounds, open actions, and follow-up dates. It sorts overdue and upcoming items by date and scopes every result to the signed-in user.

## 3. Opportunity comparison

Select two to four applications and compare their role, source details, location, work style, deadline, stipend, and overlap with profile skills. The student can weight skills, role, work style, location, stipend, and deadline in their personal priorities. Scores are normalized against the selected opportunities and omit unavailable factors. They are descriptive aids, not hiring predictions.

## 4. Follow-up planner

Set a private check-in date and a short note about what response is pending. Follow-ups appear in the planner and calendar export. PlaceTrack does not contact recruiters or read external messages.

## 5. Round debrief and question bank

An application can contain multiple assessment or interview rounds. Each round stores its own scheduled time, status, preparation notes, score, result, debrief, and feedback. Questions can be saved to the personal question bank, tagged by topic and difficulty, searched, edited, or removed.

## 6. Calendar export

The authenticated `/api/calendar.ics` endpoint generates a private iCalendar file from application deadlines, scheduled rounds, open actions, and follow-ups. It escapes user text, folds long calendar lines, and creates UTC timestamps. The frontend downloads the file for import into a calendar app.

## 7. Data migration and verification

Migration `004_student_command_center.sql` adds the fields and tables used by these workflows. It is additive, transactional, and rerunnable. Apply it to the existing database before running the updated API. Existing company rows without a user owner are not automatically assigned to an account; preserve their real ownership when resolving those rows.

Local verification commands:

```powershell
cd server
npm test
npm run test:db
```

```powershell
cd client
npm run lint
npm run build
```
