"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, X, RefreshCcw, Loader2 } from "lucide-react";
import { discardCard } from "@/app/actions/discard";

export function DiscardButton({ cardId }: { cardId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDiscard = async (redirectTo: '/scan' | '/dashboard') => {
    setIsDeleting(true);
    await discardCard(cardId, redirectTo);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 w-full justify-center"
      >
        <Trash2 className="w-4 h-4" /> Discard
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ margin: 0, padding: '1rem' }}>
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Discard Scan?</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to discard this card? This action cannot be undone. What would you like to do next?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleDiscard('/scan')}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                  {isDeleting ? "Processing..." : "Rescan Card"}
                </button>
                <button
                  onClick={() => handleDiscard('/dashboard')}
                  disabled={isDeleting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  {isDeleting ? "Processing..." : "Discard Completely"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
