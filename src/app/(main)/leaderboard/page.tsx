import { Trophy, TrendingUp, Medal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/server/db/server";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  
  // Fetch top 10 users globally by total_pnl
  const { data: topUsers } = await supabase
    .from("users")
    .select("id, handle, avatar_url, total_pnl, win_rate")
    .order("total_pnl", { ascending: false })
    .limit(10);
    
  const usersList = topUsers || [];
  
  // Use the top user for the podium (if exists)
  const topUser = usersList[0];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Leaderboard
        </h1>
      </div>

      <div className="p-4 space-y-6">
        
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="alltime">All-Time</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="week" className="mt-6 space-y-4">
            
            {/* Podium Banner (Top user) */}
            {topUser && (
              <div className="mx-4 mt-2 p-6 rounded-3xl bg-gradient-to-br from-up/20 to-transparent border border-up/30 relative overflow-hidden flex items-center">
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                  <Trophy className="w-40 h-40" />
                </div>
                
                <div className="relative z-10 flex space-x-4 items-center">
                  <Avatar className="w-16 h-16 border-2 border-up">
                    <AvatarImage src={topUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(topUser.handle)}&background=00FF66&color=000`} />
                    <AvatarFallback>#1</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-up uppercase tracking-wider flex items-center">
                      <Medal className="w-3 h-3 mr-1" />
                      #1 Global
                    </p>
                    <h2 className="text-xl font-extrabold">{topUser.handle}</h2>
                    <p className="text-sm font-medium text-white/60">₿{Number(topUser.total_pnl).toLocaleString()} P&L</p>
                  </div>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {usersList.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between bg-card p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-white/40 w-4">{index + 1}</span>
                    <Avatar className="w-10 h-10 border border-white/10">
                      <AvatarImage src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}&background=random`} />
                      <AvatarFallback>{user.handle.substring(1, 3).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{user.handle}</p>
                      <p className="text-xs text-white/40">{user.win_rate}% Win Rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-up flex items-center justify-end text-sm">
                      +₿{Number(user.total_pnl).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </TabsContent>
          
          <TabsContent value="alltime" className="mt-4 space-y-3">
             <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-white/5">
              <h3 className="text-white/80 font-semibold mb-1">Coming Soon</h3>
              <p className="text-sm text-white/40">All-time rankings calculate at end of month.</p>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-4 space-y-3">
             <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-white/5">
              <h3 className="text-white/80 font-semibold mb-1">Invite Friends</h3>
              <p className="text-sm text-white/40">Compete against your group chat.</p>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
