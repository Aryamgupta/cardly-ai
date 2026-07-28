"use client";

import { Share } from "lucide-react";
import { Card } from "@/types";
import { useState } from "react";

export function ShareContactButton({ card }: { card: Card }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const textLines = [
      card.full_name,
      card.designation ? `${card.designation}${card.company_name ? ` @ ${card.company_name}` : ''}` : card.company_name,
      card.phones?.[0] ? `Phone: ${card.phones[0]}` : null,
      card.emails?.[0] ? `Email: ${card.emails[0]}` : null,
    ].filter(Boolean);

    const shareData = {
      title: `${card.full_name} - Contact Info`,
      text: textLines.join('\n'),
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // AbortError is expected if user cancels the share sheet
      console.error("Share failed:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-border text-foreground rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
    >
      <Share className="w-5 h-5" />
      <span className="text-sm font-semibold">{copied ? "Link Copied!" : "Share Profile"}</span>
    </button>
  );
}
