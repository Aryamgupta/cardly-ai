"use client";

import { useEffect, useState } from "react";
import { usePwa } from "@/components/providers/PwaProvider";

export function PwaInstallPrompt() {
  const { isInstallable, promptInstall } = usePwa();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      // Check local storage for the 4-hour delay
      const dismissedAt = localStorage.getItem("pwa_prompt_dismissed_at");
      if (dismissedAt) {
        const timeElapsed = Date.now() - parseInt(dismissedAt, 10);
        const fourHours = 4 * 60 * 60 * 1000;
        
        if (timeElapsed < fourHours) {
          // It hasn't been 4 hours yet, so we don't show it
          return;
        } else {
          // Clear it since it's expired
          localStorage.removeItem("pwa_prompt_dismissed_at");
        }
      }
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isInstallable]);

  const handleInstallClick = async () => {
    await promptInstall();
    setShowPrompt(false);
  };

  const handleMaybeLater = () => {
    localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-slate-100 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative border border-white/50">

        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 border border-white/20">
          <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="1024" rx="220" fill="#0B1020" />
            <defs>
              <linearGradient id="icon_grad" x1="200" y1="200" x2="824" y2="824" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6366F1" />
                <stop offset="1" stop-color="#8B5CF6" />
              </linearGradient>
              <filter id="glow" x="0" y="0" width="100%" height="100%">
                <feGaussianBlur stdDeviation="20" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x="212" y="312" width="600" height="400" rx="40" fill="url(#icon_grad)" fill-opacity="0.1" stroke="url(#icon_grad)" stroke-width="40" />

            <path d="M512 362L542 482L662 512L542 542L512 662L482 542L362 512L482 482L512 362Z" fill="url(#icon_grad)" filter="url(#glow)" />
            <circle cx="512" cy="512" r="60" stroke="white" stroke-width="8" stroke-opacity="0.5" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Install Cardly AI</h2>

        <p className="text-slate-600 mb-8 text-sm leading-relaxed px-2">
          Add to your home screen for faster access, offline networking, and native push notifications.
        </p>

        <button
          onClick={handleInstallClick}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-md mb-4"
        >
          Install Now
        </button>

        <button
          onClick={handleMaybeLater}
          className="w-full bg-transparent hover:bg-slate-200/50 text-slate-500 font-medium py-3 px-6 rounded-xl transition-colors"
        >
          Maybe Later
        </button>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          1.2MB • Secure Installation
        </div>
      </div>
    </div>
  );
}
