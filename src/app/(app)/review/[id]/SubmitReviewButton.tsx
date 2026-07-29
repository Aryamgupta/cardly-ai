"use client";

import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";

export function SubmitReviewButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      form="review-form"
      disabled={pending}
      className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
      {pending ? "Saving..." : "Save to Contacts"}
    </button>
  );
}
