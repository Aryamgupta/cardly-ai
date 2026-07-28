import Link from "next/link";
import { LayoutDashboard, Users, Camera, Search, Settings } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground pb-20">
      <main className="max-w-md mx-auto min-h-screen bg-background relative shadow-sm border-x border-border">
        {children}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-background border-t border-border flex justify-between items-center px-6 py-3 z-50">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          <Link href="/contacts" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Contacts</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 -mt-5">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-4 border-background">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-foreground">Scan</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
