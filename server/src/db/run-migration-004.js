import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../db.js";

const directory = path.dirname(fileURLToPath(import.meta.url));

try {
    const sql = await fs.readFile(
        path.join(directory, "migrations", "004_student_command_center.sql"),
        "utf8"
    );
    await pool.query(sql);
    console.log("Migration 004 completed successfully.");
} catch (error) {
    console.error("Migration 004 failed:", error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
