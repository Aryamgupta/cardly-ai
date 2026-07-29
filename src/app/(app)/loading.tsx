import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 relative">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <Loader2 className="w-8 h-8 text-primary animate-spin relative z-10" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Loading...</h2>
      <p className="text-sm text-slate-500 text-center max-w-[250px]">
        Please wait a moment while we fetch your data.
      </p>
    </div>
  );
}
