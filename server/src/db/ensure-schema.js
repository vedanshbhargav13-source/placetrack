import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./pool.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const client = await pool.connect();

try {
    await client.query("SELECT pg_advisory_lock(83150427)");
    const { rows } = await client.query("SELECT to_regclass('public.users') AS users_table");

    if (!rows[0].users_table) {
        const schema = await fs.readFile(path.join(directory, "schema.sql"), "utf8");
        await client.query("BEGIN");
        try {
            await client.query(schema);
            await client.query("COMMIT");
            console.log("Fresh PlaceTrack database schema created.");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
    } else {
        console.log("PlaceTrack database schema already exists.");
    }
} finally {
    await client.query("SELECT pg_advisory_unlock(83150427)").catch(() => {});
    client.release();
    await pool.end();
}
