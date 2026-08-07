function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

export default Loader;