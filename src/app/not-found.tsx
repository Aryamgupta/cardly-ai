import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">
        Page Not Found
      </h1>

      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been moved, deleted, or you may have mistyped the address.
      </p>

      <Link
        href="/dashboard"
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
