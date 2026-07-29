import { ScanLine as ScanIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export async function RecentScans() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recentCardsData } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const recentCards = await Promise.all((recentCardsData || []).map(async (card) => {
    let signedUrl = null;
    if (card.original_image_path) {
      const { data } = await supabase.storage.from('business-cards').createSignedUrl(card.original_image_path, 3600);
      signedUrl = data?.signedUrl || null;
    }
    return { ...card, signedUrl };
  }));

  const hasCards = recentCards && recentCards.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm mb-6">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h2 className="font-bold text-lg">Recently Added</h2>
        {hasCards && <Link href="/contacts" className="text-sm text-primary font-bold hover:underline">View All</Link>}
      </div>
      
      {hasCards ? (
        <div className="divide-y divide-border">
          {recentCards.map((card) => (
            <Link href={card.processing_status === 'confirmed' ? `/contacts/${card.id}` : `/review/${card.id}`} key={card.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="w-16 h-12 bg-slate-100 rounded shadow-inner flex items-center justify-center relative overflow-hidden flex-shrink-0 border border-slate-200">
                {card.signedUrl ? (
                  <img 
                    src={card.signedUrl} 
                    alt="Card thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] font-bold text-slate-400">IMG</div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-base truncate">{card.full_name || 'Scanning...'}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {card.designation || card.company_name || (card.processing_status === 'confirmed' ? 'No Title' : 'Processing')}
                </p>
              </div>
              <div className="text-muted-foreground flex flex-col items-end gap-1">
                {card.processing_status === 'confirmed' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                ) : (
                  <span className="text-[10px] text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Review</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
           <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <ScanIcon className="w-8 h-8 opacity-50" />
           </div>
           <p className="font-medium text-foreground mb-1">No cards scanned yet</p>
           <p className="text-sm">Scan your first business card to start building your network.</p>
        </div>
      )}
    </div>
  );
}

export function RecentScansSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-100 rounded"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-border h-[72px]">
            <div className="w-16 h-12 rounded-md bg-slate-200 shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-300 rounded mb-2"></div>
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
