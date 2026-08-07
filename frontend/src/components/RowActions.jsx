import { Pencil, Trash2 } from "lucide-react";

// Edit / Delete buttons shown in the last column of every data table.
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={onEdit}
        title="Edit"
        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={onDelete}
        title="Delete"
        className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default RowActions;
