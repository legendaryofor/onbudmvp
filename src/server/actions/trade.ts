"use server";

import { createClient } from "../db/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Since we don't have a logged-in user yet, we will mock a user ID or return an error.
// In a real flow, you'd get the user from supabase.auth.getUser()

export async function buyShares(creatorId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to buy shares." };
  }

  // 2. Fetch creator price and info
  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .select("current_price, name, avatar_url")
    .eq("id", creatorId)
    .single();

  if (creatorError || !creator) {
    return { error: "Creator not found." };
  }

  const cost = Number(formData.get("amount") || 1000);
  const shares = cost / creator.current_price;

  // 3. Fetch user balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("buds_balance")
    .eq("id", user.id)
    .single();

  if (userError || !userData || userData.buds_balance < cost) {
    return { error: "Insufficient buds." };
  }

  // 4. Execute Trade (in reality, this should be a stored procedure or transaction)
  // For MVP, we'll do sequential updates.
  await supabase.from("positions").insert({
    user_id: user.id,
    creator_id: creatorId,
    shares: shares,
    avg_entry_price: creator.current_price,
    status: "open",
  });

  await supabase
    .from("users")
    .update({ buds_balance: userData.buds_balance - cost })
    .eq("id", user.id);

  revalidatePath(`/creator/[slug]`, "page");
  revalidatePath(`/portfolio`);

  // Redirect to Receipt
  const params = new URLSearchParams({
    type: "Backed",
    creatorName: creator.name || "Creator",
    avatar: creator.avatar_url || "",
    amount: cost.toString()
  });
  
  redirect(`/receipt?${params.toString()}`);
}

export async function sellShares(positionId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to sell shares." };
  }

  // 2. Fetch position & creator price
  const { data: position } = await supabase
    .from("positions")
    .select("*, creators(current_price, name, avatar_url)")
    .eq("id", positionId)
    .eq("user_id", user.id)
    .single();

  if (!position || position.status === "closed") {
    return { error: "Invalid position." };
  }
  
  let sharesToSell = Number(formData.get("shares"));
  if (!sharesToSell || sharesToSell <= 0) sharesToSell = position.shares;
  if (sharesToSell > position.shares) sharesToSell = position.shares;

  const currentPrice = position.creators.current_price;
  const returnAmount = sharesToSell * currentPrice;
  const realizedPnl = returnAmount - (sharesToSell * position.avg_entry_price);

  // 3. Execute Sell
  if (sharesToSell >= position.shares) {
    await supabase.from("positions").update({
      status: "closed",
      closed_at: new Date().toISOString(),
      exit_price: currentPrice,
      realized_pnl: (position.realized_pnl || 0) + realizedPnl,
    }).eq("id", positionId);
  } else {
    await supabase.from("positions").update({
      shares: position.shares - sharesToSell,
      realized_pnl: (position.realized_pnl || 0) + realizedPnl,
    }).eq("id", positionId);
  }

  // Fetch current user balance to add return
  const { data: userData } = await supabase
    .from("users")
    .select("buds_balance, total_pnl")
    .eq("id", user.id)
    .single();

  if (userData) {
    await supabase.from("users").update({
      buds_balance: userData.buds_balance + returnAmount,
      total_pnl: userData.total_pnl + realizedPnl,
    }).eq("id", user.id);
  }

  revalidatePath(`/creator/[slug]`, "page");
  revalidatePath(`/portfolio`);

  // Redirect to Receipt
  const params = new URLSearchParams({
    type: "Exited",
    creatorName: position.creators?.name || "Creator",
    avatar: position.creators?.avatar_url || "",
    amount: returnAmount.toFixed(2),
    pnl: realizedPnl.toFixed(2)
  });
  
  redirect(`/receipt?${params.toString()}`);
}

export async function toggleWatchlist(creatorSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("users").select("watchlist").eq("id", user.id).single();
  if (!profile) return;

  let newWatchlist = profile.watchlist || [];
  if (newWatchlist.includes(creatorSlug)) {
    newWatchlist = newWatchlist.filter((s: string) => s !== creatorSlug);
  } else {
    newWatchlist.push(creatorSlug);
  }

  await supabase.from("users").update({ watchlist: newWatchlist }).eq("id", user.id);
  revalidatePath("/feed");
  revalidatePath("/portfolio");
}
