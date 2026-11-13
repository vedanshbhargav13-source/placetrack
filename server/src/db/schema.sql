-- Canonical PlaceTrack schema for a fresh PostgreSQL database.
-- Existing installations should use the numbered migrations; do not replay this file over live data.

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    college VARCHAR(150),
    branch VARCHAR(100),
    graduation_year INTEGER CHECK (graduation_year IS NULL OR graduation_year BETWEEN 2020 AND 2100),
    cgpa NUMERIC(4,2) CHECK (cgpa IS NULL OR cgpa BETWEEN 0 AND 10),
    skills TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(160) NOT NULL,
    role TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Applied',
    website TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_companies_user_id ON companies(user_id);

CREATE TABLE jobs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    job_title VARCHAR(150) NOT NULL,
    job_type VARCHAR(50),
    jd_text TEXT,
    source VARCHAR(30) CHECK (source IS NULL OR source IN ('linkedin','gmail','college','company_site','referral','other')),
    source_context TEXT,
    apply_url TEXT,
    location TEXT,
    work_type VARCHAR(20) CHECK (work_type IS NULL OR work_type IN ('remote','hybrid','onsite')),
    stipend INTEGER CHECK (stipend IS NULL OR stipend >= 0),
    deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'Applied'
        CHECK (status IN ('Saved','Applied','OA Scheduled','Interview','Selected','Rejected')),
    notes TEXT,
    resume_label TEXT,
    follow_up_due_at TIMESTAMPTZ,
    last_response_at TIMESTAMPTZ,
    waiting_on TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_job UNIQUE (user_id, job_id)
);
CREATE INDEX idx_applications_user_updated ON applications(user_id, updated_at DESC);

CREATE TABLE application_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Saved','Applied','OA Scheduled','Interview','Selected','Rejected')),
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    note TEXT,
    event_type VARCHAR(40) NOT NULL DEFAULT 'status_change',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_application_events_timeline ON application_events(application_id, created_at);

CREATE TABLE oa_interviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_type VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending','Scheduled','Completed','Cancelled')),
    notes TEXT,
    score NUMERIC(8,2),
    topics JSONB,
    questions JSONB,
    result VARCHAR(50),
    debrief TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    priority_weights JSONB NOT NULL DEFAULT '{"skills":30,"role":25,"work_type":15,"location":15,"stipend":10,"deadline":5}'::jsonb,
    preferred_work_types TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_actions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    details TEXT,
    kind VARCHAR(30) NOT NULL DEFAULT 'task'
        CHECK (kind IN ('task','follow_up','prep','form_resume','recovery')),
    state VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (state IN ('open','waiting','blocked','done')),
    due_at TIMESTAMPTZ,
    deadline_offset_days INTEGER,
    waiting_on TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_application_actions_due ON application_actions(due_at) WHERE state <> 'done';

CREATE TABLE interview_questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    round_id INTEGER REFERENCES oa_interviews(id) ON DELETE SET NULL,
    company_name VARCHAR(160),
    role_title VARCHAR(160),
    question TEXT NOT NULL,
    topic VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IS NULL OR difficulty IN ('easy','medium','hard')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_interview_questions_user ON interview_questions(user_id, created_at DESC);
