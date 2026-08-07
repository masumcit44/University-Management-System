// Labelled form control wrapper used inside the module modals.
// CONTROL_CLASS is imported directly by pages, so it stays a plain class string.
const CONTROL_CLASS = "control mt-1.5";

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="label-mono block">{label}</label>
      {children}
    </div>
  );
}

export { CONTROL_CLASS };
export default Field;