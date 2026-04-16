import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = process.env.DATABASE_URL
    ? new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new pg.Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

pool.query("SELECT 1")
    .then(() => console.log("✅ DB CONNECTED"))
    .catch(err => console.error("❌ DB CONNECTION ERROR:", err.message));

export default pool