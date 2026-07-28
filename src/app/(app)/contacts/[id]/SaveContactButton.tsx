"use client";

import { useState } from "react";

export function SaveContactButton({ id }: { id: string }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowInstructions(true);
    
    // Open the vCard in a new tab
    window.open(`/api/contacts/${id}/vcard`, '_blank');
    
    // Automatically hide instructions after 10 seconds
    setTimeout(() => {
      setShowInstructions(false);
    }, 10000);
  };

  return (
    <div className="flex flex-col gap-3">
      <button 
        onClick={handleSave}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#0B1020] text-white rounded-xl shadow-md hover:bg-slate-800 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        <span className="text-sm font-semibold">Save to Phone Contacts</span>
      </button>

      {showInstructions && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <p className="font-semibold text-slate-900 mb-2">Importing Contact...</p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>On Android/iPhone:</strong> Your device should offer to add this contact.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>On Desktop:</strong> If the file downloads, open it to import the contact into your address book.</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
