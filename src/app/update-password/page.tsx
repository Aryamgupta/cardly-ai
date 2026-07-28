"use client";

import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { updatePassword } from "@/app/actions/auth";
import { useState, useTransition } from "react";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-tertiary text-foreground flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center space-y-4">
          <Logo className="w-16 h-16" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Create new password</h1>
            <p className="text-muted-foreground text-sm">Please enter your new password below</p>
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
            <label className="text-sm font-medium text-white" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>Updating Password <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : (
              <>Update Password <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
