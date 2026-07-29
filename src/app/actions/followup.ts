"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function setFollowUp(
  cardId: string,
  date: string | null,
  status: "pending" | "completed" | "cancelled" = "pending"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cards")
    .update({
      follow_up_date: date,
      follow_up_status: status,
    })
    .eq("id", cardId);

  if (error) {
    console.error("Failed to set follow up:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/contacts/${cardId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markFollowUpComplete(cardId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cards")
    .update({
      follow_up_status: "completed",
    })
    .eq("id", cardId);

  if (error) {
    console.error("Failed to mark follow up complete:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/contacts/${cardId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
