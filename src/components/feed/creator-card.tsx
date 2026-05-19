"use client";

import { Creator } from "@/lib/dummy-data";
import { Sparkline } from "./sparkline";
import { TrendingUp, TrendingDown, Flame, Bookmark, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

import { toggleWatchlist } from "@/server/actions/trade";
import { useTransition } from "react";

interface CreatorCardProps {
  creator: Creator;
  isActive: boolean;
  isWatched?: boolean;
}

export function CreatorCard({ creator, isActive, isWatched }: CreatorCardProps) {
  const [isPending, startTransition] = useTransition();
  const isUp = creator.price_change_pct >= 0;
  const changeColorClass = isUp ? "text-up" : "text-down";
  const changeColorHex = isUp ? "#00FF66" : "#e11d48"; // using hex for recharts stroke

  return (
    <div className="relative w-full h-full snap-start bg-card overflow-hidden">
      {/* Background Image Wrapper */}
      <div className="absolute inset-0 z-0">
        <img
          src={creator.avatar_url}
          alt={creator.name}
          className="object-cover w-full h-full opacity-60 mix-blend-luminosity"
        />
        {/* Gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent h-2/3 top-auto" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 pb-6">
        
        {/* Top/Right Action Bar */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="bg-background/40 backdrop-blur-md p-2 rounded-full mb-1">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">HOT</span>
          </div>
          
          <button 
            onClick={() => {
              startTransition(() => {
                toggleWatchlist(creator.slug);
              });
            }}
            disabled={isPending}
            className={`flex flex-col items-center transition-transform active:scale-95 ${isPending ? 'opacity-50' : ''}`}
          >
            <div className={`backdrop-blur-md p-2 rounded-full mb-1 ${isWatched ? 'bg-up/20' : 'bg-background/40'}`}>
              <Bookmark className={`w-6 h-6 ${isWatched ? 'text-up fill-up' : 'text-white'}`} />
            </div>
            <span className={`text-[10px] font-medium ${isWatched ? 'text-up' : 'text-muted-foreground'}`}>
              {isWatched ? 'Watching' : 'Watch'}
            </span>
          </button>

          <button 
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({ title: `Trade ${creator.name} on Onbud`, url: `/creator/${creator.slug}` });
              } else {
                navigator.clipboard.writeText(window.location.origin + `/creator/${creator.slug}`);
                alert("Link copied!");
              }
            }}
            className="flex flex-col items-center transition-transform active:scale-95"
          >
            <div className="bg-background/40 backdrop-blur-md p-2 rounded-full mb-1">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Share</span>
          </button>
        </div>

        {/* Main Info Area */}
        <div className="pr-16 space-y-4">
          
          {/* AI Context Badge */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10">
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-up" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-down" />
            )}
            <span className="text-xs font-medium text-white tracking-wide">
              TRENDING
            </span>
          </div>

          {/* Title and Price */}
          <Link href={`/creator/${creator.slug}`} className="block space-y-1 hover:opacity-90 transition-opacity">
            <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {creator.name}
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-extrabold tracking-tighter text-white">
                ₿{creator.current_price.toFixed(2)}
              </span>
            </div>
          </Link>

          {/* Sparkline & AI Explanation */}
          <Link href={`/creator/${creator.slug}`} className="block">
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
               <div className="shrink-0">
                 <Sparkline data={creator.sparkline} color={changeColorHex} />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center space-x-2 mb-1">
                    <span className={cn("text-sm font-bold", changeColorClass)}>
                      {isUp ? "+" : ""}{creator.price_change_pct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">24H</span>
                 </div>
                 <p className="text-xs text-white/80 line-clamp-2 leading-snug">
                   {creator.ai_context}
                 </p>
               </div>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Link href={`/creator/${creator.slug}`} className="w-full">
              <Button className="w-full bg-up hover:bg-up/90 text-background font-bold text-lg h-14 rounded-2xl shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                Buy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
