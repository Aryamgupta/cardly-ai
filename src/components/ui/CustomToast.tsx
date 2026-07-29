"use client";

import { Check, Info, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  variant: "success" | "error" | "ai";
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  badges?: string[];
}

export function CustomToast({ id, title, description, variant, actionButton, badges }: ToastProps) {
  const isSuccess = variant === "success";
  const isError = variant === "error";
  const isAi = variant === "ai";

  return (
    <div className={`
      relative flex flex-col w-full min-w-[340px] bg-white rounded-xl shadow-lg border overflow-hidden
      ${isSuccess ? "border-emerald-200" : ""}
      ${isError ? "border-red-200" : ""}
      ${isAi ? "border-violet-200" : ""}
    `}>
      {/* Left colored border */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1.5
        ${isSuccess ? "bg-emerald-400" : ""}
        ${isError ? "bg-red-500" : ""}
        ${isAi ? "bg-violet-600" : ""}
      `} />

      <div className="flex items-start p-4 pl-5">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5
          ${isSuccess ? "bg-emerald-50 text-emerald-500" : ""}
          ${isError ? "bg-red-50 text-red-500" : ""}
          ${isAi ? "bg-violet-50 text-violet-600" : ""}
        `}>
          {isSuccess && <Check className="w-5 h-5 stroke-[3]" />}
          {isError && <AlertCircle className="w-5 h-5 fill-red-500 text-white" />}
          {isAi && <Info className="w-5 h-5 fill-violet-600 text-white" />}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {isAi && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                AI
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-500 leading-snug">
              {description}
            </p>
          )}

          {/* Action Button (e.g. Retry) */}
          {actionButton && (
            <button
              onClick={() => {
                actionButton.onClick();
                toast.dismiss(id);
              }}
              className={`mt-2 text-xs font-bold ${isError ? "text-red-600 hover:text-red-700" : "text-slate-700 hover:text-slate-900"} transition-colors`}
            >
              {actionButton.label}
            </button>
          )}

          {/* Badges (e.g. AI fields) */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded border border-violet-100"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(id)}
          className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
