"use client";

import { useState } from "react";
import { updateUserSettings } from "@/app/actions/settings";
import { Bell, Mail, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";

interface SettingsFormProps {
  initialEmail: boolean;
  initialInApp: boolean;
}

export function SettingsForm({ initialEmail, initialInApp }: SettingsFormProps) {
  const [emailNotifs, setEmailNotifs] = useState(initialEmail ?? true);
  const [inAppNotifs, setInAppNotifs] = useState(initialInApp ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings(emailNotifs, inAppNotifs);
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="success"
          title="Preferences Saved"
          description="Your notification preferences have been updated."
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="error"
          title="Update Failed"
          description="Failed to save preferences. Please try again."
        />
      ));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Settings Card */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage how you receive alerts and reminders from Cardly AI.</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* In-App Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">In-App Notifications</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Receive alerts within the dashboard via the bell icon.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setInAppNotifs(!inAppNotifs)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inAppNotifs ? 'bg-primary' : 'bg-slate-200'}`}
              role="switch"
              aria-checked={inAppNotifs}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inAppNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email Reminders</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Receive daily summary emails for your upcoming follow-ups.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifs ? 'bg-primary' : 'bg-slate-200'}`}
              role="switch"
              aria-checked={emailNotifs}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailNotifs ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
        
        <div className="p-4 bg-slate-50 border-t border-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || (emailNotifs === initialEmail && inAppNotifs === initialInApp)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
