import { Bell, Camera, Users as UsersIcon, ScanLine as ScanIcon, User as UserIcon, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { NotificationMenu } from "@/components/ui/NotificationMenu";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';

  // Fetch stats
  const { count: totalContacts } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('processing_status', 'confirmed');
    
  // For simplicity, just get all cards count for scanned this week
  const { count: scannedThisWeek } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  // Fetch recent cards
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

  // Fetch pending follow-ups
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

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <UserIcon className="text-primary w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Good morning,</p>
            <h1 className="text-xl font-bold text-primary">{firstName}</h1>
          </div>
        </div>
        <NotificationMenu />
      </div>

      {/* Stats Card */}
      <div className="border border-border rounded-xl p-4 mb-6 bg-white shadow-sm">
        <h2 className="text-sm font-medium mb-4 text-muted-foreground">Networking Stats</h2>
        <div className="space-y-3">
          <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-primary">
                <UsersIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Total Contacts</span>
            </div>
            <span className="font-bold text-lg">{totalContacts || 0}</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-secondary">
                <ScanIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Scanned Total</span>
            </div>
            <span className="font-bold text-lg">{scannedThisWeek || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <Link href="/scan" className="w-full bg-primary text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform hover:scale-[1.02] mb-8">
        <Camera className="w-8 h-8" />
        <div className="text-center">
          <span className="font-bold text-xl block">Scan New Card</span>
          <span className="text-sm text-white/80">AI-powered transcription</span>
        </div>
      </Link>

      {/* Upcoming Follow-ups */}
      {hasFollowUps && (
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
      )}

      {/* Recently Added or Empty State */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
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
    </div>
  );
}
