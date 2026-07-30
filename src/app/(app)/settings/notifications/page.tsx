import { getUserSettings } from "@/app/actions/settings";
import { SettingsForm } from "./SettingsForm";
import { Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Notifications | Cardly AI",
  description: "Manage your Cardly AI notification preferences",
};

export default async function NotificationsPage() {
  const settings = await getUserSettings();

  return (
    <div className="flex-1 pb-24 md:pb-6 relative w-full pt-6">
      <div className="px-6 mb-6">
        <Link href="/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Manage your notifications and alerts.</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <SettingsForm 
          initialEmail={settings.email_notifications ?? true} 
          initialInApp={settings.in_app_notifications ?? true} 
        />
      </div>
    </div>
  );
}
