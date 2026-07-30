"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`w-full bg-slate-50 border ${error ? 'border-red-500' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3 text-[#0B1020] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#5551FF] focus:ring-2 focus:ring-[#5551FF]/20 transition-all pr-12 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          tabIndex={-1} // Don't allow tab focus on the eye icon
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
