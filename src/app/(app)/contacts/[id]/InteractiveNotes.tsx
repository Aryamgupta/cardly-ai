"use client";

import { useState, useRef, useEffect } from "react";
import { updateNotes } from "@/app/actions/contacts";
import { Loader2, Check } from "lucide-react";

export function InteractiveNotes({ id, initialNotes }: { id: string, initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    autoResize();
  }, [notes]);

  const handleBlur = async () => {
    if (notes === initialNotes) return;
    
    setStatus("saving");
    try {
      await updateNotes(id, notes);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save notes", error);
      setStatus("idle");
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add some notes about this contact..."
        className="w-full bg-transparent border-0 p-0 text-sm text-foreground focus:ring-0 resize-none min-h-[60px]"
      />
      <div className="absolute right-0 bottom-0 text-muted-foreground flex items-center justify-end pointer-events-none">
        {status === "saving" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        {status === "saved" && <Check className="w-3 h-3 text-green-500" />}
      </div>
    </div>
  );
}
