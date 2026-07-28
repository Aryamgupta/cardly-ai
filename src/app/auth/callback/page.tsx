"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleCallback = async () => {
      // The Supabase browser client automatically detects `#access_token` in the hash
      // or `?code=` in the query string and establishes the session in the background.
      // We just need to check if a session exists after initialization.
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        setTimeout(() => router.replace("/login?error=Invalid+or+expired+link"), 2000);
        return;
      }

      if (session) {
        router.replace(next);
      } else {
        setError("No valid session found in the secure link.");
        setTimeout(() => router.replace("/login?error=Invalid+or+expired+link"), 2000);
      }
    };

    handleCallback();
  }, [router, next]);

  return (
    <div className="min-h-screen bg-tertiary flex flex-col items-center justify-center p-6 text-center space-y-4">
      {error ? (
        <>
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-white">Verification Failed</h2>
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </>
      ) : (
        <>
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Verifying Secure Link</h2>
          <p className="text-muted-foreground text-sm">Please wait while we authenticate your request...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tertiary flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
