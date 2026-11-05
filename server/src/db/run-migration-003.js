
import "dotenv/config";
import pool from "../db.js";

async function runMigration() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            ALTER TABLE oa_interviews
            ADD COLUMN IF NOT EXISTS score NUMERIC(8,2),
            ADD COLUMN IF NOT EXISTS topics JSONB,
            ADD COLUMN IF NOT EXISTS questions JSONB,
            ADD COLUMN IF NOT EXISTS result VARCHAR(50)
        `);

        await client.query("COMMIT");

        console.log("Migration 003 completed successfully.");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Migration failed:", error.message);
        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
