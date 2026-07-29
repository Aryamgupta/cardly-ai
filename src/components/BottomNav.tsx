"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Camera, Search, Settings } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-background border-t border-border flex justify-between items-center px-6 py-3 z-50">
      <Link 
        href="/dashboard" 
        className={`flex flex-col items-center gap-1 ${pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">Dashboard</span>
      </Link>
      
      <Link 
        href="/contacts" 
        className={`flex flex-col items-center gap-1 ${pathname.startsWith("/contacts") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] font-medium">Contacts</span>
      </Link>
      
      <Link href="/scan" className="flex flex-col items-center gap-1 -mt-5">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background ${pathname === "/scan" ? "bg-primary" : "bg-primary/80 hover:bg-primary transition-colors"}`}>
          <Camera className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-medium ${pathname === "/scan" ? "text-primary" : "text-foreground"}`}>Scan</span>
      </Link>
      
      <Link 
        href="/search" 
        className={`flex flex-col items-center gap-1 ${pathname.startsWith("/search") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium">Search</span>
      </Link>
      
      <Link 
        href="/settings" 
        className={`flex flex-col items-center gap-1 ${pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </nav>
  );
}
