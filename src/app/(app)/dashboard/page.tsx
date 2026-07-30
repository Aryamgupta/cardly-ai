import { Camera, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { NotificationMenu } from "@/components/ui/NotificationMenu";
import { Suspense } from "react";
import { DashboardStats, DashboardStatsSkeleton } from "@/components/dashboard/DashboardStats";
import { RecentScans, RecentScansSkeleton } from "@/components/dashboard/RecentScans";
import { PendingFollowUps, PendingFollowUpsSkeleton } from "@/components/dashboard/PendingFollowUps";
import { AIRecommendation } from "@/components/dashboard/AIRecommendation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user (fast)
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile (fast)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user?.id)
    .single();

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';
  const avatarUrl = profile?.avatar_url || null;

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    if (hour < 21) return "Good evening,";
    return "Good night,";
  };

  return (
    <div className="p-6 pb-24">
      {/* Header (Loads instantly) */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="text-primary w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{greeting()}</p>
            <h1 className="text-xl font-bold text-primary">{firstName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/settings" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <NotificationMenu />
        </div>
      </div>

      {/* Stats Card (Lazy Loaded) */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Smart Suggestion (Lazy Loaded) */}
      <Suspense fallback={null}>
        <AIRecommendation />
      </Suspense>

      {/* Main Action (Instantly available) */}
      <Link href="/scan" className="w-full bg-primary text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform hover:scale-[1.02] mb-8">
        <Camera className="w-8 h-8" />
        <div className="text-center">
          <span className="font-bold text-xl block">Scan New Card</span>
          <span className="text-sm text-white/80">AI-powered transcription</span>
        </div>
      </Link>

      {/* Upcoming Follow-ups (Lazy Loaded) */}
      <Suspense fallback={<PendingFollowUpsSkeleton />}>
        <PendingFollowUps />
      </Suspense>

      {/* Recently Added (Lazy Loaded) */}
      <Suspense fallback={<RecentScansSkeleton />}>
        <RecentScans />
      </Suspense>
    </div>
  );
}
