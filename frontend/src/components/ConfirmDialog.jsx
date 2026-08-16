import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Shared delete / destructive-action confirmation.
function ConfirmDialog({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  error = null,
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null);

  // Escape cancels - never confirms; Tab cycles inside; focus returns on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    if (dialog) {
      const focusables = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length) focusables[0].focus();
    }

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      if (e.key === "Tab") {
        const focusables = Array.from(
          dialog.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
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
      <div ref={dialogRef} className="bg-panel border border-ink w-[26rem]">
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

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-2.5 mt-3"
                >
                  <AlertTriangle size={14} strokeWidth={2} className="text-danger shrink-0 mt-px" />
                  <p className="text-[0.8125rem] text-danger leading-relaxed">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-line bg-paper">
          <button onClick={onCancel} className="btn-ghost btn-pushable">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="btn-solid btn-pushable !bg-danger !border-danger hover:!bg-[#a81f16] hover:!border-[#a81f16]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;