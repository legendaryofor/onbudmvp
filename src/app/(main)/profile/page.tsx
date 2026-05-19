import { Settings, ShieldCheck, History, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/server/db/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/profile/profile-settings";

export default async function ProfilePage() {
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

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.handle.replace("@", ""))}&background=00FF66&color=000`;

  const mockBadges: any[] = [];

  async function signOutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <ProfileSettings initialHandle={profile.handle} signOutAction={signOutAction} />
      </div>

      <div className="p-4 space-y-8">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <Avatar className="w-24 h-24 border-4 border-white/10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{profile.handle.substring(1, 3).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{profile.handle}</h2>
            <p className="text-sm text-white/40">Joined {joinDate}</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Badges</h3>
          <div className="w-full text-center text-sm text-white/40 py-6 bg-card border border-white/5 rounded-2xl">
            No badges earned yet.
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/40">Public</span>
              <div className="w-8 h-4 bg-up rounded-full relative">
                <div className="absolute right-1 top-0.5 w-3 h-3 bg-background rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="w-full flex flex-col items-center justify-center text-sm text-white/40 py-8 bg-card border border-white/5 rounded-2xl">
            <History className="w-6 h-6 mb-2 opacity-50" />
            No recent trades.
          </div>
        </div>

      </div>
    </div>
  );
}
