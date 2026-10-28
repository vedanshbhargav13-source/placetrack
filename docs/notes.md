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

## Day 8: Express + PostgreSQL — Companies CRUD

### Concepts Learned

1. PostgreSQL Connection Pool
   - Created a shared connection pool using the pg package.
   - Configured the connection using DATABASE_URL.
   - Centralized pool creation in src/db/pool.js.

2. Parameterized SQL Queries
   - Used placeholders such as $1, $2, and $3.
   - Passed user-provided values separately from SQL.
   - Reduced SQL injection risks.

3. Service Layer
   - Created src/services/companies.service.js.
   - Moved database operations into service functions.
   - Implemented list, create, get, update, and delete operations.

4. Controller Refactoring
   - Updated companies.controller.js to call service functions.
   - Kept validation and HTTP responses in the controller.
   - Separated HTTP handling from database operations.

5. AsyncHandler
   - Created src/utils/asyncHandler.js.
   - Forwarded rejected promises to Express error middleware.
   - Reduced repetitive try/catch blocks.

### Architecture

Route -> Controller -> Service -> PostgreSQL

### Testing

- GET all companies: 200 OK
- GET company by ID: 200 OK
- POST company: 201 Created
- PUT company: 200 OK
- DELETE company: 204 No Content
- Invalid company ID: 400 Bad Request
- Deleted company lookup: 404 Not Found

### Key Learning

Separating routes, controllers, services, and database access
makes the backend easier to maintain and test.


## Day 9: Zod Validation, AppError & Central Error Mapping

### Concepts Learned

1. **Zod Validation**

   * Installed Zod for server-side input validation.
   * Created `src/schemas/company.schema.js`.
   * Defined validation rules for company names and optional fields.
   * Created reusable validation middleware in `src/middleware/validate.js`.

2. **Custom Application Errors**

   * Created `src/utils/AppError.js`.
   * Associated application errors with HTTP status codes.
   * Used `AppError` for invalid company IDs and missing companies.

3. **Central Error Handling**

   * Updated `src/middleware/errorHandler.js`.
   * Added handling for Zod validation errors.
   * Mapped selected PostgreSQL errors to appropriate HTTP status codes.
   * Returned consistent JSON error responses.

4. **Reusable ID Validation**

   * Created `src/schemas/id.schema.js`.
   * Used Zod to validate positive integer company IDs.
   * Removed repeated manual ID validation logic.

5. **Company Route Integration**

   * Connected validation middleware to company creation and update routes.
   * Refactored the company controller to use the service layer and `AppError`.

### Architecture

Request → Router → Validation Middleware → Controller → Service → PostgreSQL

Errors → `asyncHandler` or validation middleware → Central Error Handler → JSON Response

### Testing

* Health endpoint: successful response.
* Empty company name: 400 Bad Request.
* Valid company creation: 201 Created.
* Invalid company ID: 400 Bad Request.
* Nonexistent company: 404 Not Found.
* Unknown route: 404 Not Found.

### Key Learning

Zod provides reusable input validation, `AppError` represents application errors, and centralized error handling gives PlaceTrack consistent HTTP error responses.


# Day 10: Authentication and User-Specific Applications

## 1. Objective

The objective of Day 10 was to implement user authentication and protect user-specific application data in PlaceTrack.

The main tasks completed were:
- User signup and login.
- Password hashing using bcrypt.
- JWT generation and verification.
- Authentication middleware.
- Request validation using Zod.
- Centralized error handling.
- Applications service, controller, and routes.
- Protected applications API.
- User-specific PostgreSQL queries.
- API testing and user-isolation verification.

---

## 2. Password Hashing with bcrypt

### Concept

Password hashing converts a password into a one-way hash. The application stores the hash instead of storing the original password.

### Implementation

Installed bcrypt using npm.

The following function hashes a password:

    bcrypt.hash(password, 12)

The following function verifies a password during login:

    bcrypt.compare(password, passwordHash)

### Important Points

- Passwords are never stored as plain text.
- The value 12 is the bcrypt cost factor.
- Password verification does not require retrieving the original password.
- Password hashes must not be returned in API responses.

---

## 3. Database Migration

### File Created

- src/db/migrations/002_add_password_hash.sql
- src/db/run-migration-002.js

### Objective

The existing users table needed a password_hash column to store hashed passwords.

The migration added the column to the PostgreSQL users table.

The migration runner:
1. Connects to PostgreSQL.
2. Begins a transaction.
3. Adds the password_hash column if it does not already exist.
4. Commits the transaction.
5. Releases the database connection.

The migration was executed successfully, and the column was verified in Neon.

The schema files were also updated to include password_hash in the users table definition.

Important: The existing migration 001 must not be rerun against the already initialized database.

---

## 4. Request Validation Using Zod

### File Created

src/schemas/auth.schema.js

Two validation schemas were created:

- signupSchema
- loginSchema

### Signup Validation

The signup schema checks:
- Name is not empty.
- Name does not exceed 100 characters.
- Email has a valid format.
- Password contains at least 8 characters.
- Password does not exceed 72 characters.

### Login Validation

The login schema checks:
- Email has a valid format.
- Password is not empty.
- Password does not exceed 72 characters.

The controller also checks the password's UTF-8 byte length because bcrypt has a 72-byte input limit.

### Validation Middleware

File: src/middleware/validate.js

The middleware uses schema.safeParse(req.body) to validate incoming request data.

If validation fails, the error is forwarded to the centralized error handler.

If validation succeeds, the validated data is assigned to req.body, and the request proceeds.

This prevents invalid data from reaching the controller.

---

## 5. Authentication Service

### File Created

src/services/auth.service.js

The authentication service contains three functions.

### signupUser()

Responsibilities:
1. Hash the password using bcrypt.
2. Normalize the email to lowercase.
3. Insert the user into PostgreSQL.
4. Return the user's public information.

The database operation uses a parameterized INSERT query with RETURNING.

The returned information includes the user's ID, name, email, and creation timestamp.

The password hash is not returned.

### findUserByEmail()

This function searches for a user by email using a parameterized SELECT query.

It retrieves the password hash internally because the hash is required for password verification.

If the user does not exist, the function returns null.

### verifyPassword()

This function compares the submitted password against the stored bcrypt hash.

It returns true if the password matches and false otherwise.

### Why Use a Service Layer?

The service layer separates database operations from HTTP request handling.

This makes the code easier to maintain, test, and reuse.

---

## 6. User Signup API

### Endpoint

POST /api/auth/signup

### File

src/controllers/auth.controller.js

### Working

1. Read the name, email, and password from the request body.
2. Check the password's UTF-8 byte length.
3. Call signupUser() to create the account.
4. Generate a JWT for the new user.
5. Return the user's public information and token.
6. Handle duplicate email errors.

### Important Database Operation

The signup service inserts the name, email, and password hash into the users table.

Parameterized queries help prevent SQL injection.

### HTTP Status Codes

- 201 Created: Account created successfully.
- 400 Bad Request: Invalid request data.
- 409 Conflict: Email already exists.

---

## 7. User Login API

### Endpoint

POST /api/auth/login

### Working

1. Validate the email and password.
2. Find the user by email.
3. Compare the submitted password with the stored bcrypt hash.
4. Generate a JWT if the credentials are valid.
5. Return the public user information and token.

### Important Function

    bcrypt.compare(password, user.password_hash)

The function verifies the password without storing or retrieving the original password.

An unknown email and an incorrect password return the same generic authentication error.

HTTP status code: 401 Unauthorized.

A successful login returns 200 OK.

---

## 8. JSON Web Tokens (JWT)

### Concept

A JSON Web Token is used to authenticate subsequent requests after a successful login.

The server generates a signed token, and the client sends it with requests to protected endpoints.

### Implementation

The authentication controller uses jwt.sign() to generate tokens.

The token contains the user's ID in the subject claim and expires after one hour.

The signing secret is read from:

    process.env.JWT_SECRET

### Important Functions

- jwt.sign(): Generates a signed token.
- jwt.verify(): Verifies the token's signature and expiration.

### Security

- JWT_SECRET is stored in the server's .env file.
- The secret must never be committed to GitHub.
- Authentication tokens must not be shared publicly.
- JWTs are signed, not encrypted, so sensitive information must not be stored in their payloads.

---

## 9. Authentication Middleware

### File

src/middleware/authenticate.js

### Objective

The middleware protects routes that require an authenticated user.

### Working

1. Read the Authorization header.
2. Check that the header uses the Bearer token format.
3. Extract the JWT.
4. Verify the token's signature and expiration.
5. Extract the user's ID from the token subject.
6. Validate the ID.
7. Store the authenticated user's ID in req.user.
8. Continue to the controller if verification succeeds.

### Important Code

    req.user = {
        id: Number(decoded.sub)
    };

### Explanation

After verifying the JWT, the middleware extracts the user ID from the token's subject claim.

The controller can then access the authenticated user's ID using req.user.id.

Requests with missing, invalid, or expired tokens are rejected.

### Authentication vs Authorization

Authentication answers: Who are you?

Authorization answers: Are you allowed to access this resource?

Both are required to protect user data.

---

## 10. Centralized Error Handling

### Files

- src/middleware/errorHandler.js
- src/utils/AppError.js
- src/utils/asyncHandler.js

### Purpose

Centralized error handling provides consistent API responses when errors occur.

### Important Error Codes

- Zod validation errors: 400 Bad Request.
- PostgreSQL 23505: 409 Conflict.
- PostgreSQL 23503: 400 Bad Request.
- PostgreSQL 23502: 400 Bad Request.
- PostgreSQL 22P02: 400 Bad Request.
- Authentication errors: 401 Unauthorized.
- Unexpected server errors: 500 Internal Server Error.

The AppError class creates application-specific errors with HTTP status codes.

The asyncHandler utility forwards asynchronous controller errors to Express error-handling middleware.

Unexpected server errors return a generic message to avoid exposing internal implementation details.

---

## 11. Authentication Routes

### File

src/routes/auth.routes.js

The authentication router defines two endpoints:

- POST /signup
- POST /login

The routes use the validation middleware before calling their respective controllers.

The router is registered in src/index.js using the /api/auth prefix.

Therefore, the complete endpoints are:

- POST /api/auth/signup
- POST /api/auth/login

---

## 12. Database Relationships

PlaceTrack uses PostgreSQL to store users, companies, jobs, and applications.

### Main Tables

- users
- companies
- jobs
- applications
- application_events
- oa_interviews

### Applications Table

The applications table contains:
- id
- user_id
- job_id
- status
- applied_at
- updated_at

The user_id foreign key references users(id).

The job_id foreign key references jobs(id).

The UNIQUE constraint on user_id and job_id prevents the same user from creating duplicate applications for the same job.

The existing schema already supported user-specific applications, so no additional ownership column was required.

---

## 13. Applications Service

### File Created

src/services/applications.service.js

### Function

getApplicationsByUserId(userId)

### Objective

Retrieve application records belonging to a particular user.

### Database Tables Joined

The query joins three tables:

1. applications: Application status and dates.
2. jobs: Job title and type.
3. companies: Company name, website, and location.

### Important SQL Condition

    WHERE a.user_id = $1

The user's ID is supplied separately as a parameter.

This ensures the query retrieves only applications associated with the specified user.

The query orders the applications by applied_at in descending order, so newer applications appear first.

### Why Is This Important?

Without user-specific filtering, a user could potentially retrieve another user's private internship application records.

---

## 14. Applications Controller

### File Created

src/controllers/applications.controller.js

### Function

getMyApplications()

### Objective

Handle requests to retrieve the authenticated user's applications.

### Working

1. Read the authenticated user's ID from req.user.id.
2. Call getApplicationsByUserId(userId).
3. Wait for the database query to finish.
4. Return the application records as JSON.

### Most Important Line

    const userId = req.user.id;

The controller gets the user ID from the authentication middleware rather than trusting an ID supplied by the client.

The controller returns:
- success: Indicates whether the request succeeded.
- count: Number of applications returned.
- data: Array containing application records.

If the user has no applications, the endpoint returns an empty array with HTTP 200 OK.

---

## 15. Applications Routes

### File Created

src/routes/applications.routes.js

### Route

    router.get("/", authenticate, getMyApplications);

### Explanation

The route processes requests in the following order:

1. Express receives a GET request.
2. The authentication middleware verifies the JWT.
3. The controller executes only if authentication succeeds.
4. The controller calls the applications service.
5. The service retrieves matching records from PostgreSQL.
6. The controller returns a JSON response.

### Complete Endpoint

GET /api/applications

The route was registered in src/index.js using the /api/applications prefix.

It was registered before the 404 handler and error-handling middleware.

---

## 16. Complete Request Flow

The applications API follows this architecture:

Client
  -> Applications Route
  -> Authentication Middleware
  -> Applications Controller
  -> Applications Service
  -> PostgreSQL
  -> JSON Response

Each component has a separate responsibility.

- Routes define endpoints.
- Middleware verifies authentication.
- Controllers handle HTTP requests and responses.
- Services perform database operations.
- PostgreSQL stores and retrieves the data.

This structure improves maintainability and makes the application easier to extend.

---

## 17. API Testing Using curl

The authentication and applications APIs were tested locally using curl.

### Authentication Tests

| Test | Expected Result | Status |
|---|---|---|
| Signup with valid data | 201 Created | Passed |
| Login with valid credentials | 200 OK | Passed |
| Login with incorrect password | 401 Unauthorized | Passed |
| Login with unknown email | 401 Unauthorized | Passed |
| Signup with duplicate email | 409 Conflict | Passed |
| Request without a token | 401 Unauthorized | Passed |
| Request with an invalid token | 401 Unauthorized | Passed |
| Request with a valid token | 200 OK | Passed |

### Applications API Tests

| Test | Expected Result | Status |
|---|---|---|
| Request without a token | 401 Unauthorized | Passed |
| Request with an invalid token | 401 Unauthorized | Passed |
| Request with a valid token | 200 OK | Passed |
| User with no applications | Empty data array | Passed |
| User with an application | Application returned | Passed |

All the above tests were reported as passing.

---

## 18. User-Isolation Testing

### Objective

Verify that one user cannot retrieve another user's applications through the applications endpoint.

### Step 1: Inspect Existing Users

The users table was queried to identify the registered accounts.

Two existing users were found.

### Step 2: Inspect Existing Applications

The applications table was queried together with the jobs and companies tables.

One existing application was found, belonging to User 1.

### Step 3: Create a Test User

A separate test account was created through the signup API.

The new account received user ID 6.

### Step 4: Verify an Existing Job

Job ID 1 was checked to confirm that it existed before inserting the test application.

### Step 5: Create a Test Application

A test application was inserted for User 6, associated with Job 1.

The database insertion succeeded.

### Step 6: Test User 6

User 6 logged in and requested GET /api/applications.

Result:
- HTTP status: 200 OK.
- Count: 1.
- The test application was returned.

### Step 7: Test User 4

User 4 logged in and requested GET /api/applications.

Result:
- HTTP status: 200 OK.
- Count: 0.
- Data: Empty array.

### Conclusion

User 6 could retrieve their own application.

User 4 could not retrieve User 6's application through the tested endpoint.

This confirmed that the current applications query filters records by the authenticated user's ID.

Important: Future endpoints for retrieving, updating, or deleting individual applications must also enforce ownership checks.

---

## 19. Security Principles Learned

### 1. Password Security

Passwords must be hashed before being stored.

### 2. JWT Verification

Protected endpoints must verify tokens before allowing access.

### 3. Trusted User Identity

The user ID must come from the verified JWT rather than an untrusted request parameter.

### 4. Parameterized Queries

Parameterized SQL queries help protect against SQL injection.

### 5. User-Specific Filtering

Private application records must be filtered by the authenticated user's ID.

### 6. Ownership Checks

Authentication alone does not authorize access to every record. Ownership checks are required for individual application operations.

### 7. Secret Management

Database credentials, JWT secrets, and authentication tokens must not be committed to GitHub.

---

## 20. Files Created and Updated

### Authentication Files

- src/db/migrations/002_add_password_hash.sql
- src/db/run-migration-002.js
- src/schemas/auth.schema.js
- src/services/auth.service.js
- src/controllers/auth.controller.js
- src/routes/auth.routes.js
- src/middleware/authenticate.js

### Applications API Files

- src/services/applications.service.js
- src/controllers/applications.controller.js
- src/routes/applications.routes.js

### Existing Files Updated

- src/index.js
- src/db/schema.sql
- src/db/migrations/001_create_application_tables.sql

### Existing Utilities Used

- src/db.js
- src/middleware/validate.js
- src/middleware/errorHandler.js
- src/utils/AppError.js
- src/utils/asyncHandler.js

The exact changes will be inspected before committing them to GitHub.

---

## 21. Day 10 Outcome

Day 10 established the initial authentication and user-specific application retrieval system for PlaceTrack.

The following features were implemented and tested:

- User signup and login.
- Password hashing using bcrypt.
- JWT generation and verification.
- Authentication middleware.
- Request validation using Zod.
- Centralized error handling.
- Applications service, controller, and routes.
- Protected GET /api/applications endpoint.
- User-specific PostgreSQL queries.
- Authentication testing using curl.
- User-isolation testing using multiple user accounts.

The tests confirmed that authenticated users could retrieve their own application records without retrieving another tested user's applications.

### Future Improvements

- Implement application creation, update, and deletion APIs.
- Add ownership checks to individual application operations.
- Add automated integration tests.
- Review database constraints and validation.
- Review all Git changes and verify that secrets are excluded before pushing to GitHub.

**Day 10 successfully established the foundation for authenticated, user-specific internship application tracking in PlaceTrack.**