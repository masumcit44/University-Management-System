// Shared, timezone-aware parsing for backend date values.
//
// The MySQL DATE columns are serialized by the API as UTC ISO strings (a
// stored 2025-01-18 arrives as "2025-01-17T18:00:00.000Z" because the server
// is UTC+6). Reading the first 10 characters yields the UTC calendar date
// (2025-01-17) - one day early. We parse the instant and read the LOCAL
// calendar components instead, so a stored 2025-01-18 always renders and
// pre-fills as 2025-01-18 when the browser shares the server's timezone.

const pad = (n) => String(n).padStart(2, "0");

export function toDateInput(value) {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  const str = String(value);

  // Already a plain YYYY-MM-DD (freshly typed form value) - keep it as-is.
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

// "Today" in the browser's local timezone - avoids new Date().toISOString(),
// which returns the UTC calendar day and is off by one for morning users.
export function todayInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
