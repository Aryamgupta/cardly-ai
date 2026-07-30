"use client";

import { ChevronLeft, Database, Activity, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { queueEmptyCardsCleanup } from "@/app/actions/cleanup";

export default function DataManagementPage() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex-1 pb-24 md:pb-6 relative w-full pt-6 font-sans">
      <div className="px-6 mb-6">
        <Link href="/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Management</h1>
            <p className="text-muted-foreground">Manage and export your scanned cards.</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto">
        
        {/* Data Tools */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Your Data</h2>
            <p className="text-sm text-muted-foreground mt-1">Export your contacts or clean up failed scans.</p>
          </div>
          <div className="p-6 space-y-6 divide-y divide-border">

            {/* Export Data */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
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

            {/* Clean Up Empty Cards */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Clean Up Empty Cards</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Queue a background task to delete failed scans or cards without a name and company.</p>
                </div>
              </div>
              <button 
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await queueEmptyCardsCleanup();
                    if (result.error) {
                      toast.custom((t) => (
                        <CustomToast 
                          id={t}
                          variant="error"
                          title="Cleanup Failed"
                          description={result.error}
                        />
                      ));
                    } else {
                      toast.custom((t) => (
                        <CustomToast 
                          id={t}
                          variant="success"
                          title="Cleanup Queued"
                          description="Your request is processing. You'll receive a notification when it's done."
                        />
                      ));
                    }
                  });
                }}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-xl transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Queuing...</>
                ) : (
                  "Clean Up"
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
