"use server";

import { createClient } from "@/utils/supabase/server";

export async function queueEmptyCardsCleanup() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be logged in to perform this action." };
    }

    // Check if there is already a pending job for this user
    const { data: existingJobs, error: fetchError } = await supabase
      .from("cleanup_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);

    if (fetchError) {
      console.error("Failed to check existing jobs:", fetchError);
      return { error: "Failed to schedule cleanup. Please try again later." };
    }

    if (existingJobs && existingJobs.length > 0) {
      return { error: "A cleanup task is already in progress. Please wait for it to finish." };
    }

    // Insert a new cleanup job
    const { error } = await supabase
      .from("cleanup_jobs")
      .insert([
        {
          user_id: user.id,
          status: 'pending'
        }
      ]);

    if (error) {
      console.error("Failed to queue cleanup job:", error);
      return { error: "Failed to schedule cleanup. Please try again later." };
    }

    return { success: true };
  } catch (error) {
    console.error("Queue cleanup error:", error);
    return { error: "Internal Server Error" };
  }
}
