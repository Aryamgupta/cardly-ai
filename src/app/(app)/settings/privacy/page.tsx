"use client";

import Link from "next/link";
import { ChevronLeft, Loader2, Shield } from "lucide-react";
import { changePassword } from "@/app/actions/auth";
import { useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { PasskeyManager } from "./PasskeyManager";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/PasswordInput";

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function PrivacySecurityPage() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmPassword", data.confirmPassword);

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
        reset();
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
  };

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

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="currentPassword">
                Current Password
              </label>
              <PasswordInput
                id="currentPassword"
                placeholder="••••••••"
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="newPassword">
                New Password
              </label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
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
