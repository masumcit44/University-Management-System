import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

// Sortable column header. Click cycles: asc -> desc -> (first click sets asc).
function SortableTh({ label, sortKey, activeKey, sortDir, onSort, className = "" }) {
  const active = activeKey === sortKey;

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        className="inline-flex items-center gap-1.5 cursor-pointer group select-none uppercase tracking-[0.12em] text-[0.6875rem] font-medium text-ink-mute hover:text-ink transition-colors"
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp size={11} strokeWidth={2.2} className="shrink-0" />
          ) : (
            <ArrowDown size={11} strokeWidth={2.2} className="shrink-0" />
          )
        ) : (
          <ArrowUpDown
            size={11}
            strokeWidth={1.6}
            className="shrink-0 opacity-40 group-hover:opacity-80"
          />
        )}
      </button>
    </th>
  );
}

export default SortableTh;
