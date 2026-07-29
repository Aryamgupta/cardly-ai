"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email_notifications, in_app_notifications")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    // If column doesn't exist yet, return true by default
    return { email_notifications: true, in_app_notifications: true };
  }

  return profile;
}

export async function updateUserSettings(emailNotifs: boolean, inAppNotifs: boolean) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      email_notifications: emailNotifs,
      in_app_notifications: inAppNotifs
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating settings:", error);
    throw new Error("Failed to update settings");
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  
  return { success: true };
}
