import { BottomNav } from "@/components/shared/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative w-full max-w-md mx-auto border-x border-white/5 shadow-2xl overflow-hidden">
      <main className="flex-1 pb-16 relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
