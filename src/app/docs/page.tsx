import Link from "next/link";
import { ArrowLeft, Code } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-tertiary text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 pb-8 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Code className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-white">API Documentation</h1>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary">
            <p className="font-medium">Cardly API is currently in Private Beta.</p>
            <p className="text-sm mt-1 opacity-80">Access tokens are available exclusively to enterprise partners at this time.</p>
          </div>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Overview</h2>
          <p>
            The Cardly REST API allows you to programmatically access your extracted business card data, push new scans directly to your CRM, and trigger AI extraction workflows from your own applications.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Authentication</h2>
          <p>
            All API requests must be authenticated using a Bearer token in the Authorization header.
          </p>
          <pre className="bg-black/50 border border-white/10 p-4 rounded-lg overflow-x-auto text-sm text-white/80">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Endpoints</h2>
          
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold font-mono">GET</span>
                <code className="text-white">/v1/contacts</code>
              </div>
              <p className="text-sm">List all extracted contacts, ordered by recency.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold font-mono">POST</span>
                <code className="text-white">/v1/extract</code>
              </div>
              <p className="text-sm">Submit a base64 encoded image or URL to the AI extraction pipeline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
