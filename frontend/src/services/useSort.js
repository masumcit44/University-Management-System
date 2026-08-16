import { useMemo, useState } from "react";

// Pure client-side column sorting for the dense data tables. Sorting is
// applied to the already-loaded array only - no API, no routing changes.
export function useSort(rows, { defaultKey = null, accessors = {} } = {}) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState("asc");

  const toggle = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !rows || !rows.length) return rows || [];

    const get = accessors[sortKey] || ((row) => row?.[sortKey]);
    const dir = sortDir === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortKey, sortDir, accessors]);

  return { sorted, sortKey, sortDir, toggle };
}
