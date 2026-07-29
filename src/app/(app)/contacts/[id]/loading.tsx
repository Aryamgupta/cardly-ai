import { ArrowLeft, Edit2, Trash2 } from "lucide-react";

export default function ContactProfileLoading() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <ArrowLeft className="w-6 h-6" /> Cardly AI
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <Edit2 className="w-5 h-5" />
          <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Profile Info Skeleton */}
      <div className="flex flex-col items-center px-6 pt-2 pb-6">
        <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg mb-4 bg-slate-200"></div>
        <div className="h-8 w-48 bg-slate-300 rounded mb-3"></div>
        <div className="h-5 w-64 bg-slate-200 rounded mb-4"></div>
        
        {/* Tags Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-14 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-6 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-2 py-3 bg-slate-200 rounded-xl shadow-sm h-[72px]">
            <div className="w-5 h-5 rounded bg-slate-300"></div>
            <div className="w-10 h-3 rounded bg-slate-300"></div>
          </div>
        ))}
      </div>
      
      <div className="px-6 mb-6">
        <div className="h-[48px] w-full bg-slate-200 rounded-xl"></div>
      </div>

      {/* Detail Rows Skeleton */}
      <div className="px-6 space-y-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-border flex items-start gap-3 shadow-sm h-[74px]">
            <div className="p-2 bg-slate-100 rounded-xl shrink-0">
              <div className="w-5 h-5 rounded bg-slate-200"></div>
            </div>
            <div className="flex-1">
              <div className="h-3 w-16 bg-slate-200 rounded mb-2 mt-1"></div>
              <div className="h-4 w-40 bg-slate-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Business Card Images Skeleton */}
      <div className="px-6 mb-8">
        <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="w-full aspect-[1.75/1] bg-slate-200 rounded-xl border border-slate-300 shadow-sm"></div>
      </div>
    </div>
  );
}
