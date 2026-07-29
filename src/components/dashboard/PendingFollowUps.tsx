import { Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export async function PendingFollowUps() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: followUpsData } = await supabase
    .from('cards')
    .select('id, full_name, designation, company_name, follow_up_date, original_image_path')
    .eq('user_id', user?.id)
    .eq('follow_up_status', 'pending')
    .not('follow_up_date', 'is', null)
    .order('follow_up_date', { ascending: true })
    .limit(3);

  const followUps = await Promise.all((followUpsData || []).map(async (card) => {
    let signedUrl = null;
    if (card.original_image_path) {
      const { data } = await supabase.storage.from('business-cards').createSignedUrl(card.original_image_path, 3600);
      signedUrl = data?.signedUrl || null;
    }
    return { ...card, signedUrl };
  }));

  const hasFollowUps = followUps && followUps.length > 0;

  if (!hasFollowUps) return null;

  return (
    <div className="bg-amber-50/50 rounded-2xl border border-amber-200 overflow-hidden shadow-sm mb-6">
      <div className="flex justify-between items-center p-4 border-b border-amber-200/50 bg-amber-100/50">
        <h2 className="font-bold text-lg flex items-center gap-2 text-amber-800">
          <Clock className="w-5 h-5 text-amber-600" /> Upcoming Follow-ups
        </h2>
      </div>
      <div className="divide-y divide-amber-100">
        {followUps.map((card) => {
          const date = card.follow_up_date ? new Date(card.follow_up_date) : new Date();
          const isOverdue = date < new Date() && date.toDateString() !== new Date().toDateString();
          
          return (
            <Link href={`/contacts/${card.id}`} key={card.id} className="flex items-center gap-4 p-4 hover:bg-amber-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center relative overflow-hidden flex-shrink-0 border border-amber-200">
                {card.signedUrl ? (
                  <img 
                    src={card.signedUrl} 
                    alt="Card thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-amber-700">{card.full_name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-base truncate text-slate-800">{card.full_name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {card.designation || card.company_name}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-white border border-amber-200 text-amber-700'}`}>
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {isOverdue && <span className="text-[9px] text-red-500 font-bold uppercase mt-1">Overdue</span>}
              </div>
            </Link>
          );
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
