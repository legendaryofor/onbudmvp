"use server";

import { createClient } from "../db/server";
import { revalidatePath } from "next/cache";

export async function updateUsername(formData: FormData) {
  const handle = formData.get("handle") as string;
  if (!handle || handle.trim() === "") return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Add an @ if missing
  const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;

  await supabase
    .from("users")
    .update({ handle: formattedHandle })
    .eq("id", user.id);

  revalidatePath("/profile");
}
