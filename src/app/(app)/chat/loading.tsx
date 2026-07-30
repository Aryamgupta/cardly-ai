import { Search, Sparkles } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground relative z-10 flex items-center gap-2">
          Ask Cardly <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-2 relative z-10">
          Find anyone in your network using AI
        </p>

        {/* Search Input Skeleton */}
        <div className="mt-6 relative z-10">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div className="w-full h-14 bg-slate-100 rounded-2xl border-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 py-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="h-3 bg-slate-200 rounded-md w-1/3 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
