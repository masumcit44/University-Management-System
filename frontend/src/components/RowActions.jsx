import { Pencil, Trash2 } from "lucide-react";

// Edit / Delete buttons shown in the last column of every data table.
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-center gap-1.5">
      <button
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className="p-1.5 border border-line text-ink-mute hover:border-accent hover:text-accent hover:bg-accent-soft transition-colors"
      >
        <Pencil size={15} strokeWidth={1.9} />
      </button>

      <button
        onClick={onDelete}
        title="Delete"
        aria-label="Delete"
        className="p-1.5 border border-line text-ink-mute hover:border-danger hover:text-danger hover:bg-danger-soft transition-colors"
      >
        <Trash2 size={15} strokeWidth={1.9} />
      </button>
    </div>
  );
}

export default RowActions;