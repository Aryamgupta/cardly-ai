"use client";

import { Camera, Image as ImageIcon, X, Loader2, Scan, CheckCircle2, UploadCloud, BrainCircuit, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createCard } from "@/services/cards/createCard";
import { uploadCardImage } from "@/services/storage/uploadCardImage";
import { createClient } from "@/utils/supabase/client";

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [webRTCError, setWebRTCError] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const router = useRouter();
  const supabase = createClient();

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setWebRTCError("Live feed requires HTTPS. Using native camera instead.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access camera:", err);
        setWebRTCError("Camera access denied or unavailable.");
      }
    }

    if (!isScanning) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning]);

  const processFile = async (file: File) => {
    try {
      // Freeze the frame by getting an object URL of the file
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      
      setIsScanning(true);
      setStatus("Initializing...");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setStatus("Creating record...");
      const cardRecord = await createCard(user.id, "");
      if (!cardRecord) throw new Error("Failed to create card record");

      setStatus("Uploading image...");
      const path = await uploadCardImage(user.id, cardRecord.id, file);
      if (!path) throw new Error("Failed to upload image");

      setStatus("Extracting AI data...");
      const res = await fetch("/api/extract-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: cardRecord.id, imagePath: path })
      });

      if (!res.ok) {
        throw new Error("AI extraction failed");
      }

      setStatus("Done!");
      router.push(`/review/${cardRecord.id}`);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during scanning.");
      setIsScanning(false);
      setCapturedImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const captureCamera = () => {
    if (webRTCError || !videoRef.current?.srcObject) {
      fileInputRef.current?.click();
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            processFile(file);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Determine Current Step
  const currentStep = 
    status === "Done!" ? 3 
    : status === "Extracting AI data..." ? 2 
    : 1;

  const steps = [
    { id: 1, label: "Uploading Image", icon: UploadCloud },
    { id: 2, label: "AI Analysis", icon: BrainCircuit },
    { id: 3, label: "Finalizing", icon: Database },
  ];

  return (
    <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex flex-col">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      {!isScanning && (
        <div className="flex justify-between items-center p-6 z-10">
          <Link href="/dashboard" className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <X className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium">AI Ready</span>
          </div>
        </div>
      )}

      {/* Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        
        {/* Background Image When Captured */}
        {capturedImage && isScanning && (
           <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110" />
        )}

        {!isScanning ? (
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl border-2 border-white/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {webRTCError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
                <Camera className="w-12 h-12 text-white/50 mb-4" />
                <p className="font-medium text-sm text-white/80">{webRTCError}</p>
                <p className="text-xs text-white/50 mt-2">Tap the capture button below to open your camera.</p>
              </div>
            )}

            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none z-10">
              <div className="border-b border-r border-white"></div>
              <div className="border-b border-r border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-b border-r border-white"></div>
              <div className="border-b border-r border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>

            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl z-10"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl z-10"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl z-10"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl z-10"></div>
          </div>
        ) : (
          <div className="w-full max-w-sm z-20 flex flex-col justify-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Processing Card</h2>
            
            <div className="space-y-6">
              {steps.map(step => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const isPending = currentStep < step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105 opacity-100 translate-x-2' : isPending ? 'opacity-40' : 'opacity-100'}`}>
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white shadow-primary/30' : 'bg-white/10 text-white/50'}`}>
                       {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                     </div>
                     <div className="flex-1">
                       <p className={`font-bold text-lg transition-colors ${isActive ? 'text-white' : isPending ? 'text-white/50' : 'text-green-400'}`}>
                         {step.label}
                       </p>
                       {isActive && <p className="text-sm text-primary-200 mt-1">{status}</p>}
                     </div>
                     {isActive && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!isScanning && (
          <div className="absolute bottom-8 left-0 right-0 text-center z-10">
            <p className="text-sm font-medium text-white shadow-black drop-shadow-md bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">Align business card within frame</p>
          </div>
        )}
      </div>

      {/* Controls - Hide during scanning */}
      {!isScanning && (
        <div className="p-8 pb-12 flex justify-between items-center bg-gradient-to-t from-black via-black/80 to-transparent z-10">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          <button
            onClick={captureCamera}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-white rounded-full"></div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
