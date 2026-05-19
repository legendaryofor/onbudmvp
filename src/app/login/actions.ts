"use server";

import { createClient } from "@/server/db/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const handle = formData.get("handle") as string;
  
  if (!handle.startsWith("@")) {
    return { error: "Handle must start with @" };
  }

  const supabase = await createClient();

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user." };
  }

  // 2. Create Public Profile
  // We insert into public.users using the auth.users ID
  const { error: profileError } = await supabase
    .from("users")
    .insert({
      id: authData.user.id,
      handle: handle,
      email: email,
      buds_balance: 10000.00,
    });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // Note: In production you might want a robust cleanup or retry strategy here
    return { error: "Account created, but profile setup failed due to database permissions. See chat instructions." };
  }

  return { success: true };
}
