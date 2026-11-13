import pg from "pg";

const { Pool, types } = pg;

// PostgreSQL DATE is a calendar value, not a UTC timestamp. Keep it as YYYY-MM-DD
// so deadlines do not shift a day when the Node process runs in another timezone.
types.setTypeParser(1082, value => value);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
