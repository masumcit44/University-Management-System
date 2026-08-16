const AuditLog = require("../models/auditLogModel");

// Central helper for permission-sensitive actions. Controllers call this
// on every role change / delete / password reset so the system keeps an
// evidence trail. Writes are asynchronous and never block the request.
exports.log = (user, action, entityType, entityId, details, ip) => {

    let detailsJson = null;

    if (details !== undefined && details !== null) {

        try {

            detailsJson = JSON.stringify(details);

        } catch (error) {

            detailsJson = null;

        }

    }

    AuditLog.create(
        {
            user_id: user ? user.user_id : null,
            action,
            entity_type: entityType,
            entity_id: entityId !== undefined && entityId !== null ? String(entityId) : null,
            details: detailsJson,
            ip_address: ip || null
        },
        () => {}
    );

};
