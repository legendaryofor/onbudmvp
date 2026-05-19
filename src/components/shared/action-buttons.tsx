"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function ShareButton({ creatorName, url }: { creatorName: string, url: string }) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trade ${creatorName} on Onbud`,
          text: `I'm backing ${creatorName} on Onbud. Trade cultural momentum with me.`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleShare}
      className="rounded-full text-white hover:bg-white/10"
    >
      <Share2 className="w-5 h-5" />
    </Button>
  );
}
