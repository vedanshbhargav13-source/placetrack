import "dotenv/config";
import pool from "../db.js";

async function runMigration() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
        `);

        await client.query("COMMIT");

        console.log("Migration 002 completed successfully.");
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