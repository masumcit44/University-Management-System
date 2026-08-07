import { useEffect } from "react";
import { X } from "lucide-react";

// Shared modal shell used by every module's Add / Edit form.
function Modal({
  title,
  onClose,
  onSave,
  saveLabel = "Save",
  wide = false,
  children,
}) {
  // Escape closes the dialog
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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
            className="p-1.5 text-ink-mute hover:text-ink hover:bg-ink/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-line bg-paper">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>

          <button onClick={onSave} className="btn-solid">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;