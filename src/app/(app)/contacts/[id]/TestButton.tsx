"use client";

import { useState } from "react";
import { RefreshCw, Wand2, Crop } from "lucide-react";

export function TestButton({ cardId, originalPath }: { cardId: string, originalPath: string }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingCrop, setLoadingCrop] = useState(false);

  const handleTestAI = async () => {
    setLoadingAI(true);
    try {
      const testPath = originalPath.replace(/cropped(_\d+)?/, 'original');
      const res = await fetch("/api/extract-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, imagePath: testPath }),
      });
      
      if (res.ok) {
        alert("AI Extraction complete! Refreshing page...");
        window.location.reload();
      } else {
        alert("AI Extraction failed. Check console.");
        console.error(await res.text());
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering extraction");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleTestCrop = async () => {
    setLoadingCrop(true);
    try {
      const res = await fetch("/api/test-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      
      if (res.ok) {
        alert("Crop update complete! Refreshing page...");
        window.location.reload();
      } else {
        alert("Crop update failed. Check console.");
        console.error(await res.text());
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering crop update");
    } finally {
      setLoadingCrop(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleTestAI}
        disabled={loadingAI || loadingCrop}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-purple-200"
      >
        {loadingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
        {loadingAI ? 'PROCESSING...' : 'TEST AI PROMPT'}
      </button>

      <button 
        onClick={handleTestCrop}
        disabled={loadingAI || loadingCrop}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-indigo-200"
      >
        {loadingCrop ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Crop className="w-3.5 h-3.5" />}
        {loadingCrop ? 'PROCESSING...' : 'TEST CROP LOGIC'}
      </button>
    </div>
  );
}
