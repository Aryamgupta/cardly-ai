import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ToastListener } from "@/components/ToastListener";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground pb-20">
      <ToastListener />
      <main className="max-w-md mx-auto min-h-screen bg-background relative shadow-sm border-x border-border">
        {children}

        {/* Bottom Navigation */}
        <BottomNav />
      </main>
    </div>
  );
}
