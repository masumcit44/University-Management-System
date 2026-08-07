import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

// Shared delete / destructive-action confirmation.
function ConfirmDialog({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}) {
  // Escape cancels - never confirms
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 bg-ink/60 backdrop-blur-[2px] flex justify-center items-center z-50 p-4"
    >
      <div className="bg-panel border border-ink w-[26rem]">
        {/* Danger rule across the top */}
        <div className="h-[3px] bg-danger" />

        <div className="px-6 py-6">
          <div className="flex items-start gap-3.5">
            <span className="w-9 h-9 shrink-0 flex items-center justify-center border border-danger text-danger bg-danger-soft">
              <AlertTriangle size={17} strokeWidth={2} />
            </span>

            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg text-ink tracking-tight leading-snug">
                {title}
              </h2>

              <p className="text-[0.8125rem] text-ink-soft mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-line bg-paper">
          <button onClick={onCancel} className="btn-ghost">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="btn-solid !bg-danger !border-danger hover:!bg-[#a81f16] hover:!border-[#a81f16]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;