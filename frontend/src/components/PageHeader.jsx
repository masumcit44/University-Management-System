import { Plus } from "lucide-react";

// Page title + subtitle, with an optional primary action button on the right.
function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
