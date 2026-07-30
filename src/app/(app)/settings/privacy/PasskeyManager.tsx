"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Fingerprint, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";

interface Passkey {
  id: string;
  name: string;
  created_at: string;
}

export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const supabase = createClient();

  const loadPasskeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.passkey.list();
      if (error) throw error;
      
      // Map the passkeys to our expected format
      const mappedPasskeys = (data || []).map(p => ({
        id: p.id,
        name: p.friendly_name || 'My Device',
        created_at: p.created_at || new Date().toISOString()
      }));
      
      setPasskeys(mappedPasskeys);
    } catch (error) {
      console.error("Error loading passkeys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPasskeys();
  }, []);

  const handleAddPasskey = async () => {
    setIsRegistering(true);
    try {
      // 1. Start registration
      const { data, error } = await supabase.auth.registerPasskey();
      
      if (error) {
        throw error;
      }
      
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="success"
          title="Biometrics Enabled"
          description="Your device is now registered for biometric login."
        />
      ));
      
      loadPasskeys();
    } catch (error: E) {
      console.error("Passkey registration error:", error);
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="error"
          title="Registration Failed"
          description={error.message || "Could not register biometric passkey. Please ensure your device supports it and you are on a secure (HTTPS) connection."}
        />
      ));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      // For some supabase-js versions the api is delete or unenroll
      // Try unenroll first (most common for MFA/Passkey), fallback to delete
      const method = (supabase.auth.passkey as any).unenroll || (supabase.auth.passkey as any).delete;
      
      if (!method) {
         throw new Error("SDK does not support passkey deletion natively.");
      }
      
      const { error } = await method({ id });
      if (error) throw error;
      
      toast.success("Passkey removed");
      loadPasskeys();
    } catch (error: any) {
      console.error("Error removing passkey:", error);
      toast.error("Failed to remove passkey");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Passkeys & Biometrics</h2>
          <p className="text-sm text-muted-foreground mt-1">Use FaceID, TouchID, or your device PIN to sign in.</p>
        </div>
        <button
          onClick={handleAddPasskey}
          disabled={isRegistering}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Passkey
        </button>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Fingerprint className="w-6 h-6" />
            </div>
            <p className="text-foreground font-medium">No passkeys registered</p>
            <p className="text-sm text-muted-foreground mt-1">Register your device to sign in faster next time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map(passkey => (
              <div key={passkey.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{passkey.name}</p>
                    <p className="text-xs text-muted-foreground">Added {new Date(passkey.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePasskey(passkey.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Passkey"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
