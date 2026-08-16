const mysql = require("mysql2");
require("dotenv").config();

// Using a pool instead of a single connection: it automatically opens a new
// connection when one fails/closes, so we don't have to hand-roll reconnect
// logic. This also copes better with cross-region latency (e.g. Render in
// the US connecting to Aiven in India) than a single long-lived connection.

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    // Managed MySQL hosts (Aiven, Railway, etc.) require SSL in production.
    // Set DB_SSL=true in that provider's dashboard/env vars.
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    // Cross-region connections can take longer than the 10s default to
    // establish (TCP + TLS handshake over a long distance), so give it more room.
    connectTimeout: 30000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Quick sanity check on startup so connection problems show up clearly in logs.
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("MySQL Connected Successfully");
        connection.release();
    }
});

module.exports = db;
