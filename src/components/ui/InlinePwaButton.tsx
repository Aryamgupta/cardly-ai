"use client";

import { usePwa } from "@/components/providers/PwaProvider";
import { Download } from "lucide-react";

interface InlinePwaButtonProps {
  className?: string;
  text?: string;
  icon?: React.ReactNode;
  showDivider?: boolean;
}

export function InlinePwaButton({ 
  className = "", 
  text = "Install Cardly AI",
  icon = <Download className="w-4 h-4" />,
  showDivider = false
}: InlinePwaButtonProps) {
  const { isInstallable, promptInstall } = usePwa();

  if (!isInstallable) {
    return null;
  }

  return (
    <>
      {showDivider && (
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="shrink-0 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>
      )}
      <button
        type="button"
        onClick={promptInstall}
        className={`flex items-center justify-center gap-2 font-medium transition-colors ${className}`}
      >
        {icon}
        {text}
      </button>
    </>
  );
}
