"use client";

import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { updatePassword } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "@/lib/validations";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/PasswordInput";

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordValues) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", data.password);
      
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
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
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
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
