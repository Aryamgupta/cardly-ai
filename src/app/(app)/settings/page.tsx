import { Settings, User, Bell, Shield, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export default function SettingsPage() {
  return (
    <div className="p-6 min-h-screen bg-slate-50 pb-24">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Account Preferences</span>
          </div>
          <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-slate-50 cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Notifications</span>
          </div>
          <div className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Privacy & Security</span>
          </div>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full bg-white border border-red-200 text-red-600 rounded-2xl p-4 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
