"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyableField({ 
  icon, 
  label, 
  value,
  subValue,
  href,
  fallback = "Not provided"
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string | null; 
  subValue?: string | null;
  href?: string | null;
  fallback?: string;
}) {
  const [copied, setCopied] = useState(false);

  const displayValue = value || fallback;
  const isProvided = !!value;

  const handleCopy = async () => {
    if (!isProvided) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-4 flex gap-4 group">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {href && isProvided ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground text-sm leading-snug truncate hover:text-primary transition-colors hover:underline cursor-pointer block">
                {displayValue}
              </a>
            ) : (
              <p className="font-medium text-foreground text-sm leading-snug break-words">
                {displayValue}
              </p>
            )}
            {subValue && (
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                {subValue}
              </p>
            )}
          </div>
          
          {isProvided && (
            <button 
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
