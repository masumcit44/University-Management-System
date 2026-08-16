import { useId, cloneElement, isValidElement } from "react";

// Labelled form control wrapper used inside the module modals.
// CONTROL_CLASS is imported directly by pages, so it stays a plain class string.
const CONTROL_CLASS = "control mt-1.5";

function Field({ label, children, htmlFor, error }) {
  const autoId = useId();
  const controlId =
    htmlFor ??
    (isValidElement(children) ? children.props.id : undefined) ??
    autoId;
  const errorId = `${controlId}-error`;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || controlId,
        ...(error
          ? {
              "aria-invalid": true,
              "aria-describedby": errorId,
              className: `${children.props.className || ""} control-error`,
            }
          : {}),
      })
    : children;

  return (
    <div className="mb-4">
      <label
        htmlFor={controlId}
        className={`label-mono block ${error ? "text-danger" : ""}`}
      >
        {label}
      </label>
      {control}
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="label-mono text-danger mt-1.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { CONTROL_CLASS };
export default Field;
