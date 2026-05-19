import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, Share } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams;
  const type = params.type || "Backed";
  const creatorName = params.creatorName || "Creator";
  const avatar = params.avatar || "";
  const amount = params.amount || "0.00";
  const pnl = params.pnl || "";

  // Construct the OG Image URL
  const ogUrl = new URL("/api/og/receipt", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  ogUrl.searchParams.set("type", type);
  ogUrl.searchParams.set("creatorName", creatorName);
  ogUrl.searchParams.set("avatar", avatar);
  ogUrl.searchParams.set("amount", amount);
  if (pnl) ogUrl.searchParams.set("pnl", pnl);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-background/80 backdrop-blur-md flex items-center justify-between">
        <Link href="/feed">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <span className="font-bold text-lg">Trade Receipt</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-up tracking-tight">Trade Executed!</h1>
          <p className="text-white/60">Share your cultural investment with the world.</p>
        </div>

        {/* Receipt Image Display */}
        <div className="relative w-full max-w-md aspect-[1200/630] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src={ogUrl.toString()}
            alt="Trade Receipt"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="flex w-full max-w-md space-x-3">
           <Button className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold">
             <Download className="w-5 h-5 mr-2" /> Save
           </Button>
           <Button className="flex-1 h-14 bg-up hover:bg-up/90 text-background rounded-xl font-bold shadow-[0_0_15px_rgba(0,255,102,0.3)]">
             <Share className="w-5 h-5 mr-2" /> Share to IG
           </Button>
        </div>
      </div>
    </div>
  );
}
