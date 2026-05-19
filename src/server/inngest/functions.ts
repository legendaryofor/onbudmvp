import { inngest } from "./client";
import { createClient } from "../db/server"; // Use server client

export const mockPricingEngineJob = inngest.createFunction(
  { id: "mock-pricing-engine" },
  { cron: "*/15 * * * *" }, // Run every 15 minutes
  async ({ event, step }) => {
    // 1. Fetch all active creators
    const creators = await step.run("fetch-active-creators", async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("creators")
        .select("id, name, current_price, slug")
        .eq("is_active", true);
      
      if (error) throw error;
      return data;
    });

    if (!creators || creators.length === 0) {
      return { message: "No active creators found." };
    }

    // 2. Mock calculations for each creator
    const priceUpdates = await step.run("calculate-new-prices", () => {
      return creators.map(creator => {
        // Mock random walk: max 5% change
        const changePct = (Math.random() - 0.5) * 0.10; 
        let newPrice = creator.current_price * (1 + changePct);
        newPrice = Math.max(1, newPrice); // Floor at 1

        const isUp = newPrice >= creator.current_price;
        const trend = isUp ? "Up" : "Down";
        const pctFormatted = (Math.abs(changePct) * 100).toFixed(1);

        // Mock AI explanations
        const explanations = isUp 
          ? [
              "trending on TikTok with new dance challenge.",
              "positive sentiment surge from recent podcast appearance.",
              "massive streaming spike over the last 24 hours.",
              "major brand partnership rumors circulating online."
            ]
          : [
              "slight dip in daily mentions across social platforms.",
              "quiet period; trailing off recent momentum.",
              "negative sentiment following minor internet drama.",
              "streaming numbers stabilizing after initial peak."
            ];
        
        const explanation = explanations[Math.floor(Math.random() * explanations.length)];

        return {
          creator_id: creator.id,
          old_price: creator.current_price,
          new_price: newPrice,
          ai_context: `${trend} ${pctFormatted}% — ${explanation}`
        };
      });
    });

    // 3. Save to database in batch
    await step.run("update-database", async () => {
      const supabase = await createClient();

      // Update current price in creators table
      const updatePromises = priceUpdates.map(update => 
        supabase
          .from("creators")
          .update({ current_price: update.new_price })
          .eq("id", update.creator_id)
      );

      // Insert into price_history
      const historyInserts = priceUpdates.map(update => ({
        creator_id: update.creator_id,
        price: update.new_price,
        explanation_text: update.ai_context,
        signal_breakdown: { mock: true, trend: update.new_price >= update.old_price ? "up" : "down" }
      }));

      await Promise.all([
        ...updatePromises,
        supabase.from("price_history").insert(historyInserts)
      ]);
    });

    return { processed: creators.length };
  }
);

// Weekly Settlement Job: Sundays at 00:00 PT
// This job calculates weekly P&L, assigns badges, and resets the weekly leaderboard.
export const weeklySettlementJob = inngest.createFunction(
  { id: "weekly-settlement" },
  { cron: "0 0 * * 0" }, // Runs Sunday at midnight
  async ({ event, step }) => {
    
    // 1. Calculate Weekly P&L for all users
    await step.run("calculate-weekly-pnl", async () => {
      // In a real implementation, you would query positions closed within the last 7 days
      // and aggregate the realized_pnl per user.
      console.log("Calculating weekly P&L...");
    });

    // 2. Assign Badges (Top 10, Backer of the Week)
    await step.run("assign-badges", async () => {
      // Query top 10 users by weekly_pnl and insert into badges table.
      console.log("Assigning weekly badges...");
    });

    // 3. Generate Weekly Recap Content
    await step.run("generate-recap", async () => {
      // Call Claude API to summarize the week's biggest movers for a feed injection.
      console.log("Generating weekly recap...");
    });

    // 4. Reset Weekly Leaderboard
    await step.run("reset-weekly-leaderboard", async () => {
      // Update all users' weekly_pnl to 0.
      const supabase = await createClient();
      await supabase.from("users").update({ weekly_pnl: 0 }).neq("id", "00000000-0000-0000-0000-000000000000"); // hack to update all
    });

    return { success: true };
  }
);
