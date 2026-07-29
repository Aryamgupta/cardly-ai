"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  const isUnauthorized = error.message.toLowerCase().includes("unauthorized") || error.message.includes("401");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {isUnauthorized ? "Unauthorized Access" : "Something went wrong"}
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        {isUnauthorized 
          ? "You don't have permission to view this page. Please log in or check your access rights." 
          : "We encountered an unexpected error while processing your request. Please try again."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {isUnauthorized ? (
          <Link 
            href="/login" 
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </Link>
        ) : (
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        )}
        <Link 
          href="/" 
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
