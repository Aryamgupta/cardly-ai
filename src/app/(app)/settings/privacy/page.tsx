"use client";

import Link from "next/link";
import { ChevronLeft, Loader2, Shield, Activity } from "lucide-react";
import { changePassword } from "@/app/actions/auth";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { PasskeyManager } from "./PasskeyManager";

export default function PrivacySecurityPage() {
  const [isPending, startTransition] = useTransition();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="error"
            title="Update Failed"
            description={result.error}
          />
        ));
      } else {
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="success"
            title="Password Updated"
            description="Your password has been successfully changed."
          />
        ));
      }
    });
  }

  return (
    <div className="flex-1 pb-24 md:pb-6 relative w-full pt-6 font-sans">
      <div className="px-6 mb-6">
        <Link href="/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy & Security</h1>
            <p className="text-muted-foreground">Manage your password, biometrics, and data.</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Passkey / Biometrics Manager */}
        <PasskeyManager />

        {/* Data Management */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Data Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Export your contacts and business cards.</p>
          </div>
          <div className="p-6 space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Export Data (CSV)</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Download a CSV file containing all your scanned contacts and enriched metadata.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export');
                    if (!response.ok) throw new Error('Failed to export data');
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cardly_contacts_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    toast.custom((t) => (
                      <CustomToast 
                        id={t}
                        variant="success"
                        title="Export Successful"
                        description="Your contacts have been downloaded."
                      />
                    ));
                  } catch (error) {
                    toast.custom((t) => (
                      <CustomToast 
                        id={t}
                        variant="error"
                        title="Export Failed"
                        description="There was an issue generating your export."
                      />
                    ));
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>

          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          
          <form action={onSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                disabled={isPending}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                ) : (
                  <>Update Password</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
