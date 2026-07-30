"use client";

import { useEffect, useState } from "react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
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

      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
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
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <path d="M22 6l-10 7L2 6"></path>
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
