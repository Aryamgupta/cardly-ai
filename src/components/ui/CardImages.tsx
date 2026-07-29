"use client";

import { useState } from "react";
import { ImageModal } from "./ImageModal";
import { Maximize2 } from "lucide-react";

interface CardImagesProps {
  frontUrl: string | null;
  backUrl?: string | null;
}

export function CardImages({ frontUrl, backUrl }: CardImagesProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Front Image */}
      <div className="w-full aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden border border-border shadow-inner relative group cursor-pointer" onClick={() => frontUrl && setModalImage(frontUrl)}>
        {frontUrl ? (
          <>
            <img src={frontUrl} alt="Front of card" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
              Front
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium text-sm">
            No front image available
          </div>
        )}
      </div>

      {/* Back Image (if exists) */}
      {backUrl && (
        <div className="w-full aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden border border-border shadow-inner relative group cursor-pointer" onClick={() => setModalImage(backUrl)}>
          <img src={backUrl} alt="Back of card" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Back
          </div>
        </div>
      )}

      {/* Modal */}
      <ImageModal 
        isOpen={!!modalImage} 
        onClose={() => setModalImage(null)} 
        imageUrl={modalImage || ""} 
      />
    </div>
  );
}
