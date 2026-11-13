BEGIN;

-- Bring older PlaceTrack databases up to the columns already used by the API.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Applied';
ALTER TABLE companies ALTER COLUMN status SET DEFAULT 'Applied';
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS jd_text TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_context TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_type TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stipend INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline DATE;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_label TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS follow_up_due_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_response_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS waiting_on TEXT;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_application_status;
ALTER TABLE applications ADD CONSTRAINT chk_application_status
    CHECK (status IN ('Saved','Applied','OA Scheduled','Interview','Selected','Rejected'));

ALTER TABLE application_events ADD COLUMN IF NOT EXISTS from_status VARCHAR(30);
ALTER TABLE application_events ADD COLUMN IF NOT EXISTS to_status VARCHAR(30);
ALTER TABLE application_events ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE application_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(40) NOT NULL DEFAULT 'status_change';
ALTER TABLE application_events DROP CONSTRAINT IF EXISTS chk_event_status;
ALTER TABLE application_events ADD CONSTRAINT chk_event_status
    CHECK (status IN ('Saved','Applied','OA Scheduled','Interview','Selected','Rejected'));
ALTER TABLE application_events DROP CONSTRAINT IF EXISTS fk_events_application;
ALTER TABLE application_events ADD CONSTRAINT fk_events_application
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS score NUMERIC(8,2);
ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS topics JSONB;
ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS questions JSONB;
ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS result VARCHAR(50);
ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS debrief TEXT;
ALTER TABLE oa_interviews ADD COLUMN IF NOT EXISTS feedback TEXT;

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    priority_weights JSONB NOT NULL DEFAULT '{"skills":30,"role":25,"work_type":15,"location":15,"stipend":10,"deadline":5}'::jsonb,
    preferred_work_types TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_actions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    details TEXT,
    kind VARCHAR(30) NOT NULL DEFAULT 'task' CHECK (kind IN ('task','follow_up','prep','form_resume','recovery')),
    state VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (state IN ('open','waiting','blocked','done')),
    due_at TIMESTAMPTZ,
    deadline_offset_days INTEGER,
    waiting_on TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_application_actions_due ON application_actions(due_at) WHERE state <> 'done';

CREATE TABLE IF NOT EXISTS interview_questions (
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
CREATE INDEX IF NOT EXISTS idx_interview_questions_user ON interview_questions(user_id, created_at DESC);

COMMIT;
