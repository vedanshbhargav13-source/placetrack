import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const client = await pool.connect();

    try {
        const migrationPath = path.join(
            __dirname,
            "migrations",
            "001_create_application_tables.sql"
        );

        const sql = await fs.readFile(migrationPath, "utf8");

        // Start the transaction
        await client.query("BEGIN");

        try {
            // Remove transaction statements from the SQL file
            const migrationSql = sql
                .replace(/^BEGIN;\s*/i, "")
                .replace(/\s*COMMIT;\s*$/i, "");

            // Execute the migration
            await client.query(migrationSql);

            // Save changes
            await client.query("COMMIT");

            console.log("Migration completed successfully!");
        } catch (error) {
            // Undo changes if the migration fails
            await client.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error("Migration failed:", error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(() => {
    process.exitCode = 1;
});