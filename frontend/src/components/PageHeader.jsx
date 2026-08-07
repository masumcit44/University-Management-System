import { Plus } from "lucide-react";

// Page title + subtitle, with an optional primary action button on the right.
function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="mb-9">
      <div className="flex items-end justify-between gap-6 pb-5">
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-[2.5rem] leading-[1.05] tracking-[-0.03em] text-ink">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-ink-soft mt-2.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <button onClick={onAction} className="btn-solid shrink-0">
            <Plus size={15} strokeWidth={2.5} />
            {actionLabel}
          </button>
        )}
      </div>

      {/* Masthead rule - heavier on the left, hairline across */}
      <div className="flex">
        <span className="h-[2px] w-24 bg-ink" />
        <span className="h-[2px] flex-1 bg-line" />
      </div>
    </div>
  );
}

export default PageHeader;