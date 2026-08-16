const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const SCHEMA_FILE = path.join(__dirname, "src", "database", "schema-clean.sql");

function extractTableNames(sql) {
    const names = [];
    const regex = /CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?`?([A-Za-z0-9_]+)`?/gi;
    let match;
    while ((match = regex.exec(sql)) !== null) {
        names.push(match[2]);
    }
    return names;
}

async function main() {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME;

    if (!host || !user || !database) {
        console.error("❌ Missing required env variables. Check DB_HOST, DB_USER, DB_NAME in backend/.env");
        process.exit(1);
    }

    const connectionConfig = {
        host,
        port,
        user,
        password,
        database,
        multipleStatements: true,
    };

    if (process.env.DB_SSL && process.env.DB_SSL !== "false" && process.env.DB_SSL !== "0") {
        connectionConfig.ssl = { rejectUnauthorized: false };
    } else if (host !== "localhost" && host !== "127.0.0.1") {
        connectionConfig.ssl = { rejectUnauthorized: false };
    }

    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
    } catch (err) {
        console.error("❌ Connection failed:");
        console.error(err);
        process.exit(1);
    }

    try {
        const schema = fs.readFileSync(SCHEMA_FILE, "utf8");
        const tables = extractTableNames(schema);

        console.log(`📄 Running schema from: ${SCHEMA_FILE}`);
        await connection.query(schema);

        console.log("\n✅ Schema created successfully!");
        console.log(`📦 ${tables.length} table(s) created/verified:\n`);
        tables.forEach((name) => {
            console.log(`  ✔ ${name}`);
        });
    } catch (err) {
        console.error("❌ Error executing schema:");
        console.error(err);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
