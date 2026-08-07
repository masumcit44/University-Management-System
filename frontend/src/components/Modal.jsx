// Shared modal shell used by every module's Add / Edit form.
function Modal({
  title,
  onClose,
  onSave,
  saveLabel = "Save",
  wide = false,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto ${
          wide ? "w-[34rem]" : "w-96"
        }`}
      >
        <h2 className="text-2xl font-bold mb-5 text-slate-800">{title}</h2>

        {children}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
