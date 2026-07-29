import { Search, Bell } from "lucide-react";

export default function ContactsLoading() {
  return (
    <div className="p-6 pb-24 bg-slate-50 min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Bell className="w-5 h-5" />
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="relative mb-4 block">
        <div className="w-full h-[46px] bg-white border border-border rounded-xl"></div>
      </div>

      {/* Subheader Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-24 bg-slate-200 rounded"></div>
        <div className="h-4 w-32 bg-slate-100 rounded"></div>
      </div>

      {/* Contacts List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm h-[82px]">
            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-slate-300 rounded"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="w-6 h-6 rounded-md bg-slate-100"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
