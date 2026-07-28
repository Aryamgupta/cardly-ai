import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-tertiary text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 pb-8 border-b border-white/10">
          <Logo className="w-10 h-10" />
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Last updated: July 2026</p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Cardly AI, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Description of Service</h2>
          <p>
            Cardly AI provides business card scanning, AI-driven data extraction, and CRM synchronization tools. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. User Conduct</h2>
          <p>
            You agree to not use the service to upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, or otherwise objectionable. You are responsible for maintaining the confidentiality of your account and password.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of Cardly AI or its content suppliers and protected by international copyright laws.
          </p>
        </div>
      </div>
    </div>
  );
}
