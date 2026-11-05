
import pool from "../db.js";
import AppError from "../utils/AppError.js";

// 1. GET all applications belonging to a user
export async function getApplicationsByUserId(userId) {
    const result = await pool.query(
        `
        SELECT
            a.id AS application_id,
            a.status,
            a.applied_at,
            a.updated_at,
            j.id AS job_id,
            j.job_title,
            j.job_type,
            c.id AS company_id,
            c.company_name,
            c.website,
            c.location,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', e.id,
                            'from_status', e.from_status,
                            'to_status', e.to_status,
                            'note', e.note,
                            'created_at', e.created_at
                        )
                        ORDER BY e.created_at ASC
                    )
                    FROM application_events e
                    WHERE e.application_id = a.id
                ),
                '[]'::json
            ) AS timeline
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.applied_at DESC
        `,
        [userId]
    );

    return result.rows;
}


// 2. CREATE a new application
export async function createApplication(userId, jobId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Verify that the job belongs to the logged-in user
        const jobResult = await client.query(
            `
            SELECT j.id
            FROM jobs j
            JOIN companies c ON c.id = j.company_id
            WHERE j.id = $1 AND c.user_id = $2
            `,
            [jobId, userId]
        );

        if (jobResult.rows.length === 0) {
            throw new AppError("Job not found", 404);
        }

        // Create the application
        const applicationResult = await client.query(
            `
            INSERT INTO applications (user_id, job_id, status)
            VALUES ($1, $2, 'Applied')
            RETURNING *
            `,
            [userId, jobId]
        );

        const application = applicationResult.rows[0];

        // Create the initial timeline event
        await client.query(
            `
            INSERT INTO application_events (
                application_id,
                status,
                from_status,
                to_status,
                note
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                application.id,
                "Applied",
                null,
                "Applied",
                "Application created"
            ]
        );

        await client.query("COMMIT");

        return application;

    } catch (error) {
        // Safely roll back the transaction
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Transaction rollback failed:", rollbackError);
        }

        // Handle duplicate application
        if (error.code === "23505") {
            throw new AppError(
                "Application already exists for this job",
                409
            );
        }

        // Handle database CHECK constraint violation
        if (error.code === "23514") {
            throw new AppError("Invalid application status", 400);
        }

        throw error;

    } finally {
        client.release();
    }
}


// 3. UPDATE application status and create timeline event
export async function updateApplicationStatus(
    userId,
    applicationId,
    newStatus,
    note = null
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the application row to prevent concurrent status updates
        const result = await client.query(
            `
            SELECT status
            FROM applications
            WHERE id = $1 AND user_id = $2
            FOR UPDATE
            `,
            [applicationId, userId]
        );

        if (result.rows.length === 0) {
            throw new AppError("Application not found", 404);
        }

        const oldStatus = result.rows[0].status;

        if (oldStatus === newStatus) {
            throw new AppError(
                "Application already has this status",
                400
            );
        }

        // Update the current application status
        const updated = await client.query(
            `
            UPDATE applications
            SET status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
            `,
            [newStatus, applicationId, userId]
        );

        // Record the status change in application_events
        await client.query(
            `
            INSERT INTO application_events (
                application_id,
                status,
                from_status,
                to_status,
                note
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [applicationId, newStatus, oldStatus, newStatus, note]
        );

        await client.query("COMMIT");

        return updated.rows[0];

    } catch (error) {
        // Safely roll back the transaction
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Transaction rollback failed:", rollbackError);
        }

        if (error.code === "23514") {
            throw new AppError("Invalid application status", 400);
        }

        throw error;

    } finally {
        client.release();
    }
}


// 4. UPDATE application details (notes and resume label)
export async function updateApplication(userId, applicationId, data) {
    const result = await pool.query(
        `
        UPDATE applications
        SET notes = $1,
            resume_label = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING *
        `,
        [
            data.notes ?? null,
            data.resume_label ?? null,
            applicationId,
            userId
        ]
    );

    return result.rows[0] ?? null;
}


// 5. DELETE an application
export async function deleteApplication(userId, applicationId) {
    const result = await pool.query(
        `
        DELETE FROM applications
        WHERE id = $1 AND user_id = $2
        RETURNING id
        `,
        [applicationId, userId]
    );

    return result.rows[0] ?? null;
}
