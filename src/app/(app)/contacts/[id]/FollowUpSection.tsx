"use client";

import { useState } from "react";
import { setFollowUp, markFollowUpComplete } from "@/app/actions/followup";
import { Calendar, CheckCircle2, Clock, CalendarDays, Loader2 } from "lucide-react";

interface FollowUpSectionProps {
  cardId: string;
  initialDate?: string | null;
  initialStatus?: "pending" | "completed" | "cancelled" | null;
}

export function FollowUpSection({
  cardId,
  initialDate,
  initialStatus,
}: FollowUpSectionProps) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState("");

  const handleSetReminder = async (days: number) => {
    setLoading(true);
    const date = new Date();
    date.setDate(date.getDate() + days);

    // Format to YYYY-MM-DD for consistency
    const dateStr = date.toISOString();

    await setFollowUp(cardId, dateStr, "pending");
    setLoading(false);
  };

  const handleCustomDate = async () => {
    if (!customDate) return;
    setLoading(true);
    const dateStr = new Date(customDate).toISOString();
    await setFollowUp(cardId, dateStr, "pending");
    setShowDatePicker(false);
    setLoading(false);
  };

  const handleComplete = async () => {
    setLoading(true);
    await markFollowUpComplete(cardId);
    setLoading(false);
  };

  const isPending = initialStatus === "pending" && initialDate;

  return (
    <div className="px-6 mb-6">
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
            <Clock className="w-4 h-4" /> Follow-up Reminder
          </h3>
          {isPending && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pending
            </span>
          )}
          {initialStatus === "completed" && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
        </div>

        {isPending ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Reminder set for</p>
                <p className="text-base font-bold text-primary">
                  {new Date(initialDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors rounded-lg font-medium text-sm flex items-center gap-2 border border-emerald-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">When would you like to follow up with this contact?</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSetReminder(1)}
                disabled={loading}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                Tomorrow
              </button>
              <button
                onClick={() => handleSetReminder(3)}
                disabled={loading}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                In 3 Days
              </button>
              <button
                onClick={() => handleSetReminder(7)}
                disabled={loading}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                Next Week
              </button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`py-2.5 px-3 \${showDatePicker ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'} border rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <CalendarDays className="w-4 h-4" /> Pick Date
              </button>
            </div>

            {showDatePicker && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  value={customDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
                <button
                  onClick={handleCustomDate}
                  disabled={loading || !customDate}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
