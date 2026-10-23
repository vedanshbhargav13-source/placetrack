# Day 1 - Setup, Terminal, Git/GitHub, Product Scope

## Learned

- Terminal basics
- Git and GitHub
- Project scope
- Entities
- User flows

## Confused me

- 

## Bugs fixed

- 

## Day 2

HTTP is the communication protocol between the client and server.
The client sends a request and the server processes it and sends a response.
The client in PlaceTrack is React and the server is Express.
A request contains method, URL, headers and sometimes a body, while the response contains status, headers and body.
An API endpoint like `/api/applications` is a specific address through which React communicates with the Express server.

-
## Day 2 — Backend Basics

### What I learned
- Learned how client and server communicate using HTTP.
- Learned JSON and how it is used to send data between frontend and backend.
- Learned Node.js, npm, Express, localhost and ports.
- Built my first Express server with `GET /api/health`.
- Learned how `.env` and `dotenv` are used for configuration.
- Tested the API in Chrome, Thunder Client and Chrome DevTools.
- Learned the difference between 200, 404 and connection errors.

### What confused me
- Understanding the difference between Node.js and Express.
- Understanding how `.env` values reach `process.env`.
- Understanding the difference between a wrong route and a wrong port.

### What I did today
Built and tested the first PlaceTrack backend API and pushed the Day 2 server setup to GitHub.

### Tomorrow
Continue building the PlaceTrack backend and learn the next concepts from the roadmap.
- 

## Day 6 — PostgreSQL Database Integration

### Learned
- Understood PostgreSQL, SQL, and database tables.
- Learned CRUD operations: Create, Read, Update, and Delete.
- Connected the Node.js/Express backend to Neon PostgreSQL using the `pg` package.
- Used parameterized SQL queries to interact with the database.
- Tested API endpoints using Postman.

### Implemented
- Created the companies table in PostgreSQL.
- Added company fields: name, website, location, notes, role, status, and created_at.
- Connected the companies controller to PostgreSQL.
- Implemented database-backed GET, POST, PUT, and DELETE operations.
- Verified API responses using Postman.

### Bugs Fixed
- Configured environment variables using `import "dotenv/config"` for ES modules.
- Resolved database connection and schema issues.

### Tomorrow
- Continue improving and testing the PlaceTrack backend.


# Day 7 — Database Schema and Relationships

## Objective

Organize PlaceTrack's PostgreSQL database by defining related tables, establishing foreign-key relationships, and preparing useful SQL queries for application tracking.

## Database Setup

* Used PostgreSQL hosted on Neon.
* Created `schema.sql` to document the database schema.
* Created a migration file at `server/src/db/migrations/001_create_application_tables.sql`.
* Created a migration runner at `server/src/db/run-migration.js`.
* Executed the migration successfully.

## Tables

The existing `companies` table was retained. The migration added five tables:

1. **users** — Stores user information.
2. **jobs** — Stores job opportunities associated with companies.
3. **applications** — Connects users to jobs and tracks application status.
4. **application_events** — Stores application status events.
5. **oa_interviews** — Stores online assessments and interview details.

## Relationships

* `jobs.company_id` references `companies.id`.
* `applications.user_id` references `users.id`.
* `applications.job_id` references `jobs.id`.
* `application_events.application_id` references `applications.id`.
* `oa_interviews.application_id` references `applications.id`.

Foreign keys use `ON DELETE RESTRICT` to prevent deletion of records that are referenced by related records.

## SQL Queries

Created `server/src/db/queries.sql` with five queries:

1. Retrieve applications with user, job, and company details.
2. Count applications for each company.
3. Count applications by status.
4. Retrieve applications with online assessment and interview details.
5. Find companies without applications.

## Testing and Verification

* Executed the database migration successfully.
* Verified that all six tables exist.
* Verified foreign-key relationships.
* Inserted test records for a user, job, application, application event, and online assessment.
* Verified that the backend health endpoint responds successfully.
* Verified that the existing companies API remains functional.

## Files Created or Updated

* `server/src/db/schema.sql`
* `server/src/db/queries.sql`
* `server/src/db/run-migration.js`
* `server/src/db/migrations/001_create_application_tables.sql`
* `server/src/test-db.js`
* `docs/notes.md`

## Outcome

Established the initial relational database structure for PlaceTrack and prepared SQL queries for retrieving application, company, job, and assessment information.

**Note:** The new database tables and SQL queries have been created, but dedicated API endpoints for users, jobs, applications, events, and assessments still need to be implemented.
