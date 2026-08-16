import { Plus } from "lucide-react";

// Page title + subtitle, with an optional primary action button on the right.
function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between gap-4 md:gap-6 pb-5 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[2rem] md:text-[2.5rem] leading-[1.05] tracking-[-0.01em] text-ink">
            {title}
          </h1>

          {subtitle && (
            <p className="flex items-start gap-2.5 mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 bg-accent mt-[0.4375rem] shrink-0"
              />
              <span>{subtitle}</span>
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="btn-solid btn-pushable h-10 shrink-0 whitespace-nowrap w-full sm:w-auto justify-center mt-4 sm:mt-0 self-end"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
            {actionLabel}
          </button>
        )}
      </div>

      {/* Masthead rule - heavier on the left, hairline across */}
      <div className="accent-rule">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
    </div>
  );
}

export default PageHeader;
