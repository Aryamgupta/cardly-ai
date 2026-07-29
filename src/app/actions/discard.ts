"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function discardCard(cardId: string, redirectTo: '/scan' | '/dashboard') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Make sure we only delete the card belonging to the user
    await supabase.from("cards").delete().eq("id", cardId).eq("user_id", user.id);
  }
  
  redirect(redirectTo);
}
