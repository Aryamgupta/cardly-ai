import { Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { FolloUpType } from "@/types";
import { FolloUpCard } from "../ui/Cards/FollowUpCard";
// import { folloUpType } from "@/types";

export async function PendingFollowUps() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: followUpsData } = await supabase
    .from('cards')
    .select('id, full_name, designation, company_name, follow_up_date')
    .eq('user_id', user?.id)
    .eq('follow_up_status', 'pending')
    .not('follow_up_date', 'is', null)
    .order('follow_up_date', { ascending: true })
    .limit(3);

  const cards: FolloUpType[] = followUpsData ?? [];
  const hasFollowUps = cards && cards.length > 0;

  if (!hasFollowUps) return null;

  return (
    <div className="bg-amber-50/50 rounded-2xl border border-amber-200 overflow-hidden shadow-sm mb-6">
      <div className="flex justify-between items-center p-4 border-b border-amber-200/50 bg-amber-100/50">
        <h2 className="font-bold text-lg flex items-center gap-2 text-amber-800">
          <Clock className="w-5 h-5 text-amber-600" /> Upcoming Follow-ups
        </h2>
      </div>
      <div className="divide-y divide-amber-100">
        {cards.map((card) => {
          return <FolloUpCard card={card} key={card.id} />
        })}
      </div>
    </div>
  );
}

export function PendingFollowUpsSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded mb-4 ml-1"></div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-border h-[72px]">
            <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-300 rounded mb-2"></div>
              <div className="h-3 w-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
