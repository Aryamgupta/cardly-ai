"use client";

import Link from "next/link";
import { ArrowRight, Loader2, AlertCircle, ArrowLeft, Fingerprint } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { signIn } from "@/app/actions/auth";
import { InlinePwaButton } from "@/components/ui/InlinePwaButton";
import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleBiometricLogin() {
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPasskey();
        
        if (signInError) throw signInError;
        
        // Passkey success, reload or route to redirect
        router.push("/dashboard");
      } catch (err: any) {
        console.error("Biometric login failed:", err);
        setError(err.message || "Failed to sign in with passkey.");
      }
    });
  }

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-tertiary text-foreground flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center space-y-4">
          <Logo className="w-16 h-16" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Enter your details to sign in to your account
            </p>
          </div>
        </div>

        <form action={onSubmit} className="space-y-4 mt-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className="text-sm font-medium text-white"
                htmlFor="password"
              >
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>Signing In <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={isPending}
          className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Fingerprint className="w-5 h-5" />
          Sign in with Passkey / Biometrics
        </button>

        <div className="mt-6 pt-2">
          <InlinePwaButton 
            showDivider 
            text="Install Cardly AI"
            className="w-full bg-transparent border border-primary text-primary py-3.5 rounded-xl hover:bg-primary/10 mt-2" 
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&lsquo;t have an account?{" "}
          <Link
            href="/signup"
            className="text-white hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
