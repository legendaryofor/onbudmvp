"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple } from "lucide-react";
import Image from "next/image";
import { login, signup } from "./actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = isSignUp ? await signup(formData) : await login(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/feed");
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-up/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-8">
        
        {/* Logo / Branding */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-auto mb-2">
             <Image src="/onbud-logo.svg" alt="Onbud Logo" width={200} height={80} priority />
          </div>
          <div className="text-center">
            <p className="text-white/60 font-medium text-lg">The Creator Stock Exchange</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-card border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider pl-1">Handle</label>
                <Input 
                  name="handle" 
                  type="text" 
                  placeholder="@username" 
                  required 
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-up/50 focus:ring-up/50"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider pl-1">Email</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-up/50 focus:ring-up/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider pl-1">Password</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-up/50 focus:ring-up/50"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-12 bg-up hover:bg-up/90 text-background font-bold text-lg rounded-xl shadow-[0_0_15px_rgba(0,255,102,0.2)] mt-4"
            >
              {isPending ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center space-x-4 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs font-medium text-white/40 uppercase">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Social Auth (UI Only for now, requires Dashboard config) */}
          <div className="grid grid-cols-2 gap-3">
             <Button type="button" variant="outline" className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10" onClick={() => alert("Requires OAuth setup in Supabase Dashboard")}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
             </Button>
             <Button type="button" variant="outline" className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10" onClick={() => alert("Requires OAuth setup in Supabase Dashboard")}>
                <Apple className="w-5 h-5 mr-2" />
                Apple
             </Button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center">
           <button 
             type="button" 
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-sm text-white/60 hover:text-white transition-colors"
           >
             {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
           </button>
        </div>

      </div>
    </div>
  );
}
