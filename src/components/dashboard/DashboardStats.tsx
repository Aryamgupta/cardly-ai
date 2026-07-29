import { Users as UsersIcon, ScanLine as ScanIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export async function DashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  return (
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
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4 mb-6 bg-white shadow-sm animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center h-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-200"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-8 bg-slate-300 rounded"></div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center h-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-200"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-8 bg-slate-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
