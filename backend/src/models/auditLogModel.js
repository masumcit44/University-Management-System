const db = require("../config/db");

const AuditLog = {

    // Create Log Entry
    create: (entry, callback) => {

        const sql = `
            INSERT INTO audit_logs
            (
                user_id,
                action,
                entity_type,
                entity_id,
                details,
                ip_address
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                entry.user_id,
                entry.action,
                entry.entity_type,
                entry.entity_id,
                entry.details,
                entry.ip_address
            ],
            callback
        );

    }

};

module.exports = AuditLog;
