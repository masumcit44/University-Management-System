import { ChevronLeft, ChevronRight } from "lucide-react";

// Mono record-range footer with Prev/Next, used under paged data tables.
function Pager({ startIndex, endIndex, total, page, pageCount, onPage }) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-line bg-paper">
      <p className="label-mono text-ink-soft">
        <span className="font-mono text-ink">
          {startIndex}–{endIndex}
        </span>
        <span className="text-ink-mute"> of {total} records</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="btn-ghost btn-pushable h-8 !px-2.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>

        <p className="label-mono text-ink-soft px-1" aria-live="polite">
          {String(page).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
        </p>

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="btn-ghost btn-pushable h-8 !px-2.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default Pager;
