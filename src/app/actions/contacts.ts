"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("cards")
    .update({ notes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/contacts/${id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updates = {
    full_name: formData.get("full_name") as string,
    designation: formData.get("designation") as string,
    company_name: formData.get("company_name") as string,
    emails: [formData.get("email") as string].filter(Boolean),
    phones: [formData.get("phone") as string].filter(Boolean),
    website: formData.get("website") as string,
    address: { text: formData.get("address") as string },
  };

  const { error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/contacts/${id}`);
  revalidatePath("/contacts");
}
