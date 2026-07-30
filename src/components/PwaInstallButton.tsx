"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
      }
    }
  };

  // Only render if we have a prompt (which means it's Android/Chrome and installable)
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full h-4 bg-white/5 border border-white/10 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
      >
        <Download className="w-4 h-4" />
        Install App
      </button>
    </div>
  );
}
