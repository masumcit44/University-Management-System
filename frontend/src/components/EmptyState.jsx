// Shown when a module has no records yet.
function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-line">
      {Icon && (
        <span className="w-12 h-12 mb-5 flex items-center justify-center border border-line text-ink-mute">
          <Icon size={20} strokeWidth={1.6} />
        </span>
      )}

      <p className="font-display font-bold text-base text-ink tracking-tight">
        {title}
      </p>

      {hint && (
        <p className="text-[0.8125rem] text-ink-soft mt-2 max-w-sm leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

export default EmptyState;