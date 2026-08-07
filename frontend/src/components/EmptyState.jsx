// Shown when a module has no records yet.
function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      {Icon && <Icon size={40} className="mb-3" />}
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );
}

export default EmptyState;
