import { User, Bell, Shield, LogOut, ChevronRight, Link2, HelpCircle, Pencil, Database } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch latest profile from DB for realtime updates
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user?.id)
    .single();

  const email = user?.email || "user@example.com";
  const name = profile?.full_name || user?.user_metadata?.full_name || "User";
  // Fallback to a placeholder avatar if none exists
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  return (
    <div className="p-6 min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <h1 className="text-[22px] font-bold mb-8 text-[#0f172a]">Settings</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-primary/20">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            </div>
            <Link href="/settings/account" className="absolute bottom-0 right-0 w-7 h-7 bg-[#5551FF] rounded-full flex items-center justify-center border-2 border-[#F8FAFC] shadow-sm text-white hover:bg-[#5551FF]/90 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0B1020]">{name}</h2>
            <p className="text-[#64748b] text-[15px]">{email}</p>
          </div>
        </div>

        {/* Settings List Card */}
        <div className="bg-white rounded-[20px] border border-[#e2e8f0] overflow-hidden shadow-sm">
          <Link href="/settings/account" className="flex items-center gap-4 p-5 border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#5551FF] rounded-2xl flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0B1020] text-[15px]">Account Preferences</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">Profile info, language, and region</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </Link>

          <Link href="/settings/notifications" className="flex items-center gap-4 p-5 border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#5551FF] rounded-2xl flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0B1020] text-[15px]">Notifications</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">Push, email, and alert preferences</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </Link>

          <Link href="/settings/privacy" className="flex items-center gap-4 p-5 border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#5551FF] rounded-2xl flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0B1020] text-[15px]">Privacy & Security</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">Manage your passkeys and passwords</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </Link>

          <Link href="/settings/data" className="flex items-center gap-4 p-5 border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#5551FF] rounded-2xl flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0B1020] text-[15px]">Data Management</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">Export cards and clean up empty scans</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </Link>

          <Link href="/settings/help" className="flex items-center gap-4 p-5 hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-[#EEF2FF] text-[#5551FF] rounded-2xl flex items-center justify-center group-hover:bg-[#E0E7FF] transition-colors">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0B1020] text-[15px]">Help & Support</h3>
              <p className="text-[13px] text-[#64748b] mt-0.5">FAQs, contact support, and tutorials</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </Link>
        </div>

        {/* Existing Bottom / Sign Out */}
        <form action={signOut}>
          <button type="submit" className="w-full bg-white border border-red-200 text-red-600 rounded-2xl p-4 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
