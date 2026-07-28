"use client";

import Link from "next/link";
import { ArrowRight, Loader2, AlertCircle, ArrowLeft, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { resetPassword } from "@/app/actions/auth";
import { useState, useTransition } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="min-h-screen bg-tertiary text-foreground flex flex-col items-center justify-center p-6 relative">
      <Link href="/login" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center space-y-4">
          <Logo className="w-16 h-16" />
          {!success && (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Reset password</h1>
              <p className="text-muted-foreground text-sm">Enter your email and we'll send you a reset link</p>
            </div>
          )}
        </div>

        {success ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4 mt-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <MailCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We've sent a secure password reset link to your email address. Please click the link to continue.
            </p>
            <div className="pt-4">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Return to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form action={onSubmit} className="space-y-4 mt-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white" htmlFor="email">Email address</label>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="alex@example.com" 
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
                <>Sending Link <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
