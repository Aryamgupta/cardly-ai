import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Menu,
  Home,
  User,
  Plus,
  Search,
  RefreshCw,
  Zap,
  Rocket,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tertiary text-foreground dark flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold text-white tracking-wide">
            Cardly AI
          </span>
        </div>
        <button className="text-white/80 p-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-16 relative overflow-hidden">
        {/* Ambient Background Glow for Big Screens */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none hidden lg:block opacity-50"></div>

        {/* Hero Section */}
        <div className="w-full max-w-5xl flex flex-col items-start text-left md:items-center md:text-center space-y-8 relative z-10 lg:pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Now in Private Beta
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Professional Network, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Reimagined by AI.
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mt-4 leading-relaxed">
            Scan any business card. AI extracts the context, not just the text.
            Build your smart CRM in seconds.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              Watch Demo <PlayCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Screen Container for Mockup & Features */}
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 mt-24 lg:mt-32 relative z-10">
          {/* Mockup Preview Area (Left on Desktop) */}
          <div className="w-full max-w-sm lg:w-1/2 lg:max-w-md relative lg:sticky lg:top-24">
            <div className="text-center text-[10px] font-bold text-white/40 tracking-widest uppercase mb-4 lg:hidden">
              Trusted by 50,000+ Professionals
            </div>
            {/* Mock Phone Frame */}
            <div className="relative w-full aspect-[9/19] rounded-[2.5rem] border-8 border-white/10 bg-black overflow-hidden shadow-2xl">
              {/* Camera cutout */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-white/10 rounded-b-xl z-20 flex justify-center items-center gap-4">
                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
              </div>

              {/* Phone Screen Content */}
              <div className="absolute inset-0 bg-[#0B1020] flex flex-col p-4 pt-10">
                <div className="flex justify-between items-center text-white mb-8">
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs">
                    X
                  </div>
                  <span className="text-xs font-bold">Scanning...</span>
                  <Zap className="w-5 h-5" />
                </div>

                <div className="flex-1 border-2 border-dashed border-primary/50 rounded-2xl relative flex items-center justify-center mb-10 bg-primary/5">
                  {/* Mock card */}
                  <div className="w-4/5 h-1/3 bg-white/10 rounded-lg border border-white/20 relative overflow-hidden p-3 flex flex-col justify-between">
                    <div className="flex gap-2 items-start">
                      <div className="w-1/2 h-3 bg-white/30 rounded"></div>
                      <div className="w-6 h-6 rounded-full bg-white/20 ml-auto"></div>
                    </div>
                    <div className="w-1/3 h-2 bg-white/20 rounded"></div>

                    {/* Laser */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_#6366F1]"></div>
                  </div>
                </div>

                {/* Mock Tooltips */}
                <div className="flex gap-2 mb-4">
                  <div className="bg-primary/20 border border-primary/40 text-primary text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3" /> Name: Alex Rivers
                  </div>
                  <div className="bg-primary/20 border border-primary/40 text-primary text-[10px] px-2 py-1 rounded-full">
                    CEO @ Cardly
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-white/80 leading-tight">
                    <strong className="text-secondary">AI Insight:</strong> met
                    at TechSummit. Interested in CRM integration and series B
                    funding discussions. High priority follow-up.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid (Right on Desktop) */}
          <div className="w-full max-w-md lg:max-w-xl lg:w-1/2 space-y-4 lg:space-y-6 lg:pt-12">
            <div className="hidden lg:block text-left text-xs font-bold text-white/40 tracking-widest uppercase mb-8">
              Trusted by 50,000+ Professionals
            </div>

            <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Intelligent Extraction
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                Our neural network doesn&apos;t just read words—it understands
                roles, companies, and relationship context instantly.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Search className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Global Search
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                Find anyone by name, skill, or that specific conversation you
                had at a conference three months ago.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Universal Sync
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                Seamlessly push new contacts to Salesforce, HubSpot, or your
                native phone contacts with one tap.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 p-8 lg:p-10 rounded-3xl mt-8 relative overflow-hidden">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 relative z-10">
                Master Your Rolodex
              </h3>
              <p className="text-white/80 text-sm lg:text-base leading-relaxed relative z-10">
                The average professional loses 30% of their contacts within one
                month. Cardly ensures you never lose a connection again.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-4">
              <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <Rocket className="w-6 h-6 lg:w-8 lg:h-8 text-secondary mb-2" />
                <div className="text-2xl lg:text-4xl font-bold text-white">
                  99.8%
                </div>
                <div className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  Accuracy
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="text-3xl lg:text-5xl font-bold text-primary mb-1">
                  2M+
                </div>
                <div className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Cards Scanned
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 lg:p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-4">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                AI-Ready
              </div>
              <div className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-wider">
                LLM Analysis
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center py-12 px-6 border-t border-white/10 pb-32">
        <div className="flex items-center gap-2 mb-4">
          <Logo className="w-6 h-6" />
          <span className="text-lg font-bold text-white">Cardly AI</span>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          © 2024 Cardly AI Precision Networking.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground font-medium">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            API Docs
          </Link>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Nav (Marketing) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1020]/90 backdrop-blur-md border-t border-white/10 pb-safe md:hidden z-50">
        <div className="flex items-center justify-around p-3 pb-6 relative">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-white"
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <div className="absolute left-1/2 -top-6 -translate-x-1/2">
            <Link
              href="/scan"
              className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform border-4 border-[#0B1020]"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>

          <Link
            href="/login"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-white transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
