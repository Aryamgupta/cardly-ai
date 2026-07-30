import { createClient } from "@/utils/supabase/server";

import { User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForm } from "./AccountForm";

export const metadata = {
  title: "Account Preferences | Cardly AI",
  description: "Manage your Cardly AI profile and account preferences",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the latest profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, job_title")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || "";
  const jobTitle = profile?.job_title || "";
  const email = user.email || "";

  return (
    <div className="flex-1 pb-24 md:pb-6 relative w-full pt-6">
      <div className="px-6 mb-6">
        <Link href="/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Preferences</h1>
            <p className="text-muted-foreground">Manage your profile info and account preferences.</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <AccountForm 
          userId={user.id}
          initialName={name} 
          initialJobTitle={jobTitle}
          initialEmail={email}
          initialAvatarUrl={avatarUrl}
        />
      </div>
    </div>
  );
}
