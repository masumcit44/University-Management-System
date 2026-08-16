import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Shared modal shell used by every module's Add / Edit form.
function Modal({
  title,
  onClose,
  onSave,
  saveLabel = "Save",
  wide = false,
  hideActions = false,
  saved = false,
  saveHint = null,
  modalError = null,
  children,
}) {
  const dialogRef = useRef(null);

  // Escape closes; Tab cycles inside the dialog; focus returns on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    if (dialog) {
      const focusables = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length) focusables[0].focus();
    }

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
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
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-ink/60 backdrop-blur-[2px] flex justify-center items-center z-50 p-4"
    >
      <div
        ref={dialogRef}
        className={`bg-panel border border-ink max-h-[90vh] flex flex-col ${
          wide ? "w-[36rem]" : "w-[26rem]"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-line">
          <div>
            <p className="label-mono">Eastern University</p>
            <h2 className="font-display font-bold text-xl text-ink tracking-tight mt-1.5">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-ink-mute hover:text-ink hover:bg-ink/5 active:translate-y-px transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {modalError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-2.5 mb-4"
            >
              <AlertTriangle size={14} strokeWidth={2} className="text-danger shrink-0 mt-px" />
              <p className="text-[0.8125rem] text-danger leading-relaxed">
                {modalError}
              </p>
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        {!hideActions && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-line bg-paper">
            {saveHint && (
              <p className="label-mono text-ink-mute mr-auto self-center hidden sm:block">
                {saveHint}
              </p>
            )}

            <button onClick={onClose} className="btn-ghost btn-pushable">
              Cancel
            </button>

            {saved ? (
              <button
                disabled
                className="btn-solid btn-pushable !bg-ok !border-ok cursor-default"
              >
                Saved ✓
              </button>
            ) : (
              <button onClick={onSave} className="btn-solid btn-pushable">
                {saveLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;