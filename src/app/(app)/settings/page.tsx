import { User, Bell, Shield, LogOut, Key, ChevronRight, Gift } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";
export default function SettingsPage() {
  return (
    <div className="p-6 min-h-screen bg-slate-50 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <Link href="/settings/preferences" className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer transition-colors">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium flex-1 text-foreground">Account Preferences</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link href="/settings/change-password" className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer transition-colors">
            <Key className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium flex-1 text-foreground">Change Password</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link href="/settings/invite" className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer transition-colors">
            <Gift className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium flex-1 text-foreground">Invite Friends</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium flex-1 text-foreground">Notifications</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium flex-1 text-foreground">Privacy & Security</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full bg-white border border-red-200 text-red-600 rounded-2xl p-4 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
