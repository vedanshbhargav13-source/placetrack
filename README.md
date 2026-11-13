# PlaceTrack

PlaceTrack is a private placement and internship command center. Capture an opportunity, keep its application details together, and see the next step that needs attention.

## Features

- Quick opportunity capture with source notes, application links, and separate deadlines.
- Application stages, rounds, notes, and round debriefs.
- A planner for deadlines, scheduled rounds, follow-ups, and open actions.
- Deadline ripple: actions linked to a deadline move when that deadline changes; the application timeline records the change.
- Personal opportunity comparison using editable weights for skills, role, work style, location, stipend, and deadline.
- A searchable personal interview question bank and reusable profile details.
- Private iCalendar (`.ics`) export for deadlines, rounds, actions, and follow-ups.
- JWT authentication and user ownership checks on private records.

Comparison scores summarize the details and priorities saved by the student. They are not hiring predictions. PlaceTrack records and organizes external application work; it does not submit forms or send messages.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement)
- PostgreSQL, either local or hosted

## Configure the server

Create `server/.env` from `server/.env.example` and set a PostgreSQL connection string and a strong random `JWT_SECRET`. Set `CLIENT_ORIGIN` to the local frontend URL. Keep `.env` private and out of Git.

The current database already contains the original PlaceTrack tables. Run the additive feature migration once from the server folder:

```powershell
cd server
node src/db/run-migration-004.js
```

Migration 004 is safe to rerun and does not delete existing application data. It creates the action, question, and preference tables and adds the columns needed by the API. Existing companies without an owner remain untouched; they will not appear in a signed-in user's private company list until assigned to an owner.

## Run PlaceTrack

In one terminal:

```powershell
cd server
npm install
npm start
```

In another terminal:

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. The API listens on port `5000` by default. To use a different API address, set `VITE_API_URL` in `client/.env.local` (for example, `http://localhost:5000/api`).

## Verify

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

`npm test` covers input boundaries, priority scoring, typo search, migration safety, and calendar escaping and line folding. `npm run test:db` exercises authenticated API routes and PostgreSQL-backed flows against the configured database; it creates uniquely named temporary test accounts and removes them in cleanup. Run the integration suite only when `DATABASE_URL` points to the database you intend to verify.
