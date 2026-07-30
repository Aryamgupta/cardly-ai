"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PwaContextType {
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  deferredPrompt: any | null;
  clearPrompt: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  promptInstall: async () => {},
  deferredPrompt: null,
  clearPrompt: () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const clearPrompt = () => {
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        promptInstall,
        deferredPrompt,
        clearPrompt,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
