"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Name, email, and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        full_name: name,
      },
    },
  });

  console.log({error})

  if (error) {
    let errorMessage = error.message;
    // Handle Supabase 500 rate limit errors or empty object stringification
    if (typeof errorMessage === 'object' || errorMessage === "{}" || (error as any).status === 500) {
      errorMessage = "Server is busy or email limit reached. Please try again later.";
    }
    return { error: errorMessage || "Failed to sign up" };
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Supabase SSR auto-refresh bug: if a stale session exists, signInWithPassword might fail
  // with an "Invalid Refresh Token" error because it attempts to refresh the old session first.
  // The first failure clears the stale local state, so a second attempt succeeds.
  if (error && error.message.includes("Refresh Token")) {
    const retry = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    error = retry.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  // Determine base URL dynamically (e.g. localhost for dev, production URL for prod)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${baseUrl}/auth/callback?next=/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Both password fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
