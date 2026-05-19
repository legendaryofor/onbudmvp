import { TrendingUp, Wallet, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/server/db/server";
import { redirect } from "next/navigation";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch public profile
  let { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Auto-heal: If profile doesn't exist, create it (assumes RLS allows this now)
    const { data: newProfile, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        handle: `@user_${user.id.substring(0, 6)}`,
        email: user.email,
        buds_balance: 10000.00
      })
      .select("*")
      .single();
      
    if (error || !newProfile) {
      return <div className="p-4 text-center mt-20">Error loading or creating profile. Did you run the SQL snippet?</div>;
    }
    profile = newProfile;
  }

  // Calculate portfolio value (For MVP: balance + (open positions * current price))
  // We'll mock the active positions calculation here until we build the full DB query
  const portfolio_value = Number(profile.buds_balance); // Simplified for MVP

  const isUpTotal = profile.total_pnl >= 0;
  const isUpWeekly = profile.weekly_pnl >= 0;

  // Fetch watchlist creators
  let watchedCreators: any[] = [];
  if (profile.watchlist && profile.watchlist.length > 0) {
    const { data } = await supabase.from("creators").select("*").in("slug", profile.watchlist);
    if (data) watchedCreators = data;
  }

  // Fetch open positions
  const { data: openPositionsData } = await supabase
    .from("positions")
    .select("*, creators(name, avatar_url, current_price, slug)")
    .eq("user_id", user.id)
    .eq("status", "open");
  const openPositions = openPositionsData || [];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-xl font-bold">Portfolio</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Main Stats Card */}
        <div className="bg-gradient-to-br from-card to-card/50 rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-up/20 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <p className="text-sm text-white/60 font-medium tracking-wide">Total Value</p>
            <h2 className="text-5xl font-extrabold tracking-tighter">₿{portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            
            <div className="flex items-center space-x-2 pt-2">
              <div className={`flex items-center space-x-1 ${isUpTotal ? 'text-up' : 'text-down'}`}>
                {isUpTotal ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                <span className="font-bold">{isUpTotal ? "+" : ""}₿{Number(profile.total_pnl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <span className="text-xs text-white/40 uppercase font-semibold">All Time</span>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-white/5">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-white/60 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold">Buying Power</span>
              </div>
              <p className="text-2xl font-bold">₿{Number(profile.buds_balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center space-x-2 text-white/60 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold">Win Rate</span>
              </div>
              <p className="text-2xl font-bold">{profile.win_rate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Positions / Watchlist */}
        <Tabs defaultValue="positions" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="positions">Open Positions</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions" className="mt-4 space-y-3">
             {openPositions.length > 0 ? (
               openPositions.map((pos) => (
                 <a href={`/creator/${pos.creators.slug}`} key={pos.id} className="block">
                   <div className="flex items-center justify-between p-4 bg-card border border-white/5 rounded-2xl mb-3">
                     <div className="flex items-center space-x-3">
                       <img src={pos.creators.avatar_url} alt={pos.creators.name} className="w-10 h-10 rounded-full object-cover" />
                       <div>
                         <span className="font-bold block">{pos.creators.name}</span>
                         <span className="text-xs text-white/60">{Number(pos.shares).toFixed(2)} shares @ ₿{Number(pos.avg_entry_price).toFixed(2)}</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="font-bold text-white block">₿{(pos.shares * pos.creators.current_price).toFixed(2)}</span>
                       <span className={`text-xs font-bold ${(pos.creators.current_price >= pos.avg_entry_price) ? 'text-up' : 'text-down'}`}>
                         {((pos.creators.current_price - pos.avg_entry_price) / pos.avg_entry_price * 100).toFixed(1)}%
                       </span>
                     </div>
                   </div>
                 </a>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                <div className="bg-white/10 p-3 rounded-full mb-3">
                  <Wallet className="w-6 h-6 text-white/40" />
                </div>
                <h3 className="text-white/80 font-semibold mb-1">No Open Positions</h3>
                <p className="text-sm text-white/40">You aren't backing any creators right now.</p>
              </div>
             )}
          </TabsContent>
          
          <TabsContent value="watchlist" className="mt-4 space-y-3">
             {watchedCreators.length > 0 ? (
               watchedCreators.map(creator => (
                 <a href={`/creator/${creator.slug}`} key={creator.id} className="block">
                   <div className="flex items-center justify-between p-4 bg-card border border-white/5 rounded-2xl mb-3">
                     <div className="flex items-center space-x-3">
                       <img src={creator.avatar_url} alt={creator.name} className="w-10 h-10 rounded-full object-cover" />
                       <span className="font-bold">{creator.name}</span>
                     </div>
                     <span className="font-bold text-white">₿{creator.current_price.toFixed(2)}</span>
                   </div>
                 </a>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                <div className="bg-white/10 p-3 rounded-full mb-3">
                  <Eye className="w-6 h-6 text-white/40" />
                </div>
                <h3 className="text-white/80 font-semibold mb-1">Watchlist Empty</h3>
                <p className="text-sm text-white/40">Watch creators to keep track of their momentum.</p>
              </div>
             )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
