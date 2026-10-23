-- ============================================
-- PlaceTrack: Useful SQL Queries
-- Day 7 - Database Relationships and Queries
-- ============================================


-- Query 1: Retrieve all applications with user, job, and company details

SELECT
    a.id AS application_id,
    u.name AS user_name,
    c.company_name,
    j.job_title,
    a.status,
    a.applied_at
FROM applications AS a
JOIN users AS u
    ON a.user_id = u.id
JOIN jobs AS j
    ON a.job_id = j.id
JOIN companies AS c
    ON j.company_id = c.id
ORDER BY a.applied_at DESC;


-- Query 2: Count applications for each company

SELECT
    c.company_name,
    COUNT(a.id) AS total_applications
FROM companies AS c
LEFT JOIN jobs AS j
    ON c.id = j.company_id
LEFT JOIN applications AS a
    ON j.id = a.job_id
GROUP BY c.id, c.company_name
ORDER BY total_applications DESC;


-- Query 3: Count applications by status

SELECT
    status,
    COUNT(*) AS total_applications
FROM applications
GROUP BY status
ORDER BY total_applications DESC;


-- Query 4: View applications with their interview and assessment details

SELECT
    a.id AS application_id,
    c.company_name,
    j.job_title,
    a.status AS application_status,
    oi.round_type,
    oi.scheduled_at,
    oi.status AS round_status
FROM applications AS a
JOIN jobs AS j
    ON a.job_id = j.id
JOIN companies AS c
    ON j.company_id = c.id
LEFT JOIN oa_interviews AS oi
    ON a.id = oi.application_id
ORDER BY a.id;


-- Query 5: Find companies with no applications

SELECT
    c.id AS company_id,
    c.company_name
FROM companies AS c
LEFT JOIN jobs AS j
    ON c.id = j.company_id
LEFT JOIN applications AS a
    ON j.id = a.job_id
WHERE a.id IS NULL
ORDER BY c.company_name;