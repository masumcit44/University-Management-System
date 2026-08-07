// Indeterminate loading state - squared blocks instead of a spinner.
function Loader({ text = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="flex gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 bg-ink animate-pulse" />
        <span className="w-2.5 h-2.5 bg-ink animate-pulse [animation-delay:180ms]" />
        <span className="w-2.5 h-2.5 bg-ink animate-pulse [animation-delay:360ms]" />
      </div>

      <p className="label-mono">{text}</p>
    </div>
  );
}

export default Loader;