import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-tertiary text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 pb-8 border-b border-white/10">
          <Logo className="w-10 h-10" />
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Last updated: July 2026</p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you use Cardly AI, we collect information you provide directly to us, such as when you create an account, scan a business card, or update your profile. This includes your name, email address, and the contents of any business cards you scan.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including using Artificial Intelligence (LLMs) to accurately extract and contextualize data from business card images.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information and the contact data you scan into our system. Your data is encrypted at rest and in transit.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@cardly.example.com.
          </p>
        </div>
      </div>
    </div>
  );
}
