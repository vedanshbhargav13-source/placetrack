BEGIN;

-- Migration 001: Create application tracking tables

-- 1. Users table
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs table
CREATE TABLE jobs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_jobs_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE RESTRICT
);

-- 3. Applications table
CREATE TABLE applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Applied',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_application_status
        CHECK (
            status IN (
                'Applied',
                'OA Scheduled',
                'Interview',
                'Selected',
                'Rejected'
            )
        ),

    CONSTRAINT uq_user_job
        UNIQUE (user_id, job_id)
);

-- 4. Application Events table
CREATE TABLE application_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_event_status
        CHECK (
            status IN (
                'Applied',
                'OA Scheduled',
                'Interview',
                'Selected',
                'Rejected'
            )
        )
);

-- 5. OA and Interviews table
CREATE TABLE oa_interviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL,
    round_type VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_oa_interviews_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_oa_interviews_status
        CHECK (
            status IN (
                'Pending',
                'Scheduled',
                'Completed',
                'Cancelled'
            )
        )
);

COMMIT;