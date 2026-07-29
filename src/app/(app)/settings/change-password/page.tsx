"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { changePassword } from "@/app/actions/auth";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";

export default function ChangePasswordPage() {
  const [isPending, startTransition] = useTransition();
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
        router.push("/settings");
      }
    });
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Change Password</h1>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <form action={onSubmit} className="space-y-4">
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
              className="w-full bg-slate-50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-2 pt-2">
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
              className="w-full bg-slate-50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
              className="w-full bg-slate-50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
              <>Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
