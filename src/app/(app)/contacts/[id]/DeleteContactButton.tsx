"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteContactButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Contact"
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
