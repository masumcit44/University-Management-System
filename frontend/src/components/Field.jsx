// Labelled form control wrapper used inside the module modals.
const CONTROL_CLASS =
  "border border-slate-200 w-full rounded-lg p-2.5 mt-1 outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

export { CONTROL_CLASS };
export default Field;
