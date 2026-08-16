// Shared enum guard for write endpoints.
//
// MySQL's non-strict sql_mode silently coerces an invalid ENUM value to ''
// while the query still "succeeds" - so the API must reject bad values before
// insert/update, instead of reporting success for data that wasn't stored.

const ATTENDANCE_STATUS = ["Present", "Absent", "Late"];
const EXAM_TYPES = ["Mid", "Assignment", "Quiz", "Final"];
const PAYMENT_STATUS = ["Paid", "Pending", "Failed"];
const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Mobile Banking"];

exports.isValidEnum = (value, allowed) => allowed.includes(value);

exports.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
exports.EXAM_TYPES = EXAM_TYPES;
exports.PAYMENT_STATUS = PAYMENT_STATUS;
exports.PAYMENT_METHODS = PAYMENT_METHODS;
