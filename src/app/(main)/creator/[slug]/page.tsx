import { createClient } from "@/server/db/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/feed/sparkline"; // Reuse or create a bigger chart
import { ChevronLeft, Share2, Star } from "lucide-react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { ShareButton } from "@/components/shared/action-buttons";
import { buyShares, sellShares } from "@/server/actions/trade";

export default async function CreatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch creator
  const { data: creator, error } = await supabase
    .from("creators")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !creator) {
    notFound();
  }

  // Calculate mock changes
  const priceChange = (creator.current_price - creator.fundamental_anchor);
  const pctChange = (priceChange / creator.fundamental_anchor) * 100;
  const isUp = pctChange >= 0;
  const changeColorClass = isUp ? "text-up" : "text-down";
  const changeColorHex = isUp ? "#00FF66" : "#e11d48";

  let position = null;
  if (user) {
    const { data } = await supabase
      .from("positions")
      .select("id")
      .eq("user_id", user.id)
      .eq("creator_id", creator.id)
      .eq("status", "open")
      .single();
    if (data) position = data;
  }

  // Mock chart data (longer for detail page)
  const sparklineData = generateMockSparkline(Number(creator.current_price), 50);

  const buyAction = buyShares.bind(null, creator.id);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-white/5">
        <Link href="/feed">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <span className="font-semibold text-lg">{creator.name}</span>
        <ShareButton creatorName={creator.name} url={`/creator/${creator.slug}`} />
      </div>

      <div className="p-4 space-y-6">
        {/* Header Profile */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
            <img src={creator.avatar_url || ""} alt={creator.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <div className="bg-white/10 p-1 rounded-full text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{creator.category} • Tier {creator.tier}</p>
          </div>
        </div>

        {/* Price & Chart */}
        <div className="space-y-4 bg-card rounded-2xl p-5 border border-white/5 shadow-xl">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Price</p>
            <div className="flex items-end space-x-3">
              <span className="text-3xl font-extrabold tracking-tighter">₿{Number(creator.current_price).toFixed(2)}</span>
              <div className="flex items-center space-x-1 mb-1">
                {isUp ? <TrendingUp className={`w-5 h-5 ${changeColorClass}`} /> : <TrendingDown className={`w-5 h-5 ${changeColorClass}`} />}
                <span className={`text-lg font-bold ${changeColorClass}`}>
                  {isUp ? "+" : ""}{pctChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="h-40 w-full mt-4 -ml-2">
            <Sparkline data={sparklineData} color={changeColorHex} />
          </div>
        </div>

        {/* AI Context */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-primary flex items-center">
              <Flame className="w-4 h-4 mr-1.5" /> AI Market Context
            </h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Updated 4m ago</span>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            {isUp 
              ? "Cultural momentum is accelerating. Recent social mentions are up 45% week-over-week, and streaming numbers indicate a breakout hit." 
              : "Consolidating at support. Social volume has cooled off slightly, but fundamental anchor remains strong."}
          </p>
        </div>

        {/* Your Position */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Your Position</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            {position ? (
              <p className="text-up font-bold">You hold an active position in {creator.name}!</p>
            ) : (
              <p className="text-muted-foreground text-sm">You don't own any shares of {creator.name} yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-[65px] left-1/2 -translate-x-1/2 w-full max-w-md z-50 p-4 bg-background/90 backdrop-blur-xl border-t border-white/10 flex space-x-3">
        <form action={buyAction} className="flex-[2] flex space-x-2">
          <div className="relative w-24">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-bold">₿</span>
            <input 
              type="number" 
              name="amount" 
              defaultValue={100} 
              min={1} 
              className="w-full bg-white/10 text-white font-bold text-lg h-14 rounded-2xl pl-8 pr-2 outline-none border border-white/10 focus:border-up/50" 
            />
          </div>
          <Button type="submit" className="flex-1 bg-up hover:bg-up/90 text-background font-bold text-lg h-14 rounded-2xl">
            Buy
          </Button>
        </form>
        {position && (
          <form action={sellShares.bind(null, position.id)} className="flex-1">
            <Button type="submit" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg h-14 rounded-2xl border border-white/10">
              Sell
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function generateMockSparkline(startPrice: number, points: number = 20) {
  let current = startPrice;
  const data = [current];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.5) * (startPrice * 0.08); 
    current = Math.max(1, current + change); 
    data.push(current);
  }
  return data;
}
