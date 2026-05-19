import { createClient } from "@/server/db/server";
import { CreatorCard } from "@/components/feed/creator-card";
import { Creator } from "@/lib/dummy-data"; // We will repurpose this type

export const revalidate = 60; // Revalidate every minute

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let watchlist: string[] = [];
  if (user) {
    const { data: profile } = await supabase.from("users").select("watchlist").eq("id", user.id).single();
    if (profile?.watchlist) watchlist = profile.watchlist;
  }

  // Fetch active creators
  const { data: creatorsData, error } = await supabase
    .from("creators")
    .select("*")
    .eq("is_active", true)
    .order("current_price", { ascending: false });

  if (error || !creatorsData) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Error loading feed. {error?.message}
      </div>
    );
  }

  if (creatorsData.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-white space-y-4 px-6 text-center">
        <h2 className="text-2xl font-bold">No Creators Found</h2>
        <p className="text-white/60">It looks like the database is empty. Please run the SQL seed script to populate the feed!</p>
      </div>
    );
  }

  // Transform to match the UI component's expected format
  const formattedCreators: Creator[] = creatorsData.map((c) => {
    // Calculate a mock 24h change for now, since we haven't built the historical aggregation
    const priceChange = (c.current_price - c.fundamental_anchor);
    const pctChange = (priceChange / c.fundamental_anchor) * 100;
    
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      avatar_url: c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
      category: c.category as "music" | "internet" | "content",
      current_price: Number(c.current_price),
      price_change_24h: Number(priceChange.toFixed(2)),
      price_change_pct: Number(pctChange.toFixed(1)),
      // Random sparkline based on current price for visual effect
      sparkline: generateMockSparkline(Number(c.current_price)),
      ai_context: pctChange >= 0 
        ? "Positive momentum driving prices up over the last 24h." 
        : "Cooling off after recent highs, finding support.",
    };
  });

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar pb-16">
      {formattedCreators.map((creator, index) => (
        <CreatorCard 
          key={creator.id} 
          creator={creator} 
          isActive={index === 0} 
          isWatched={watchlist.includes(creator.slug)}
        />
      ))}
    </div>
  );
}

// Helper to generate a somewhat realistic sparkline (random walk)
function generateMockSparkline(startPrice: number, points: number = 20) {
  let current = startPrice;
  const data = [current];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * (startPrice * 0.05); // max 5% jump per point
    current = Math.max(1, current + change); // floor at 1
    data.push(current);
  }
  return data;
}
