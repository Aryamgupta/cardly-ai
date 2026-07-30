"use client";

import { Camera, Image as ImageIcon, X, Loader2, Scan, CheckCircle2, UploadCloud, BrainCircuit, Database, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createCard } from "@/services/cards/createCard";
import { uploadCardImage } from "@/services/storage/uploadCardImage";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { toAppError } from "@/utils/errors";

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [webRTCError, setWebRTCError] = useState("");
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<"front" | "back_prompt" | "back" | "event_tag">("front");
  const [eventName, setEventName] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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

    if (!isScanning && scanStep !== "back_prompt" && scanStep !== "event_tag") {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, scanStep]);

  const startProcessing = async (front: File, back?: File) => {
    try {
      setIsScanning(true);
      setStatus("Initializing...");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setStatus("Creating record...");
      const cardRecord = await createCard(user.id, "", eventName);
      if (!cardRecord) throw new Error("Failed to create card record");

      setStatus("Uploading image(s)...");
      const frontPath = await uploadCardImage(user.id, cardRecord.id, front, '');
      if (!frontPath) throw new Error("Failed to upload front image");

      let backPath = null;
      if (back) {
        backPath = await uploadCardImage(user.id, cardRecord.id, back, '_back');
      }

      setStatus("Extracting AI data...");
      const res = await fetch("/api/extract-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cardId: cardRecord.id, 
          imagePath: frontPath,
          backImagePath: backPath
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.is_duplicate) {
           setIsScanning(false);
           setDuplicateWarning(errorData);
           return;
        }
        throw new Error(errorData?.error || "AI extraction failed");
      }

      setStatus("Done!");
      router.push(`/review/${cardRecord.id}`);

    } catch (err) {
      const appErr = toAppError(err);
      console.error(appErr);
      toast.error(appErr.message || "Something went wrong during scanning.");
      setIsScanning(false);
      setScanStep("front");
      setFrontFile(null);
      setCapturedImage(null);
    }
  };

  const handleCapture = (file: File) => {
    if (scanStep === "front") {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setFrontFile(file);
      setScanStep("back_prompt");
    } else if (scanStep === "back" && frontFile) {
      setBackFile(file);
      setScanStep("event_tag");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCapture(file);
  };

  const captureCamera = () => {
    if (webRTCError || !videoRef.current?.srcObject) {
      cameraInputRef.current?.click();
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
            const file = new File([blob], `capture_${scanStep}.jpg`, { type: "image/jpeg" });
            handleCapture(file);
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

  if (scanStep === "back_prompt" && capturedImage && !isScanning) {
    return (
      <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex flex-col">
        <div className="flex justify-between items-center p-6 z-10">
          <button onClick={() => { setScanStep("front"); setFrontFile(null); setCapturedImage(null); }} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="text-sm font-medium">Front Captured</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <img src={capturedImage} alt="Front of card" className="w-full max-w-sm max-h-[50vh] object-contain rounded-2xl shadow-2xl mb-8 border border-white/20" />
          
          <div className="w-full max-w-sm space-y-4">
            <button 
              onClick={() => { setScanStep("back"); setCapturedImage(null); }}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" /> Scan Back of Card
            </button>
            <button 
              onClick={() => { setScanStep("event_tag"); }}
              className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            >
              Process Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (scanStep === "event_tag" && !isScanning) {
    return (
      <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex flex-col">
        <div className="flex justify-between items-center p-6 z-10">
          <button onClick={() => { setScanStep("front"); setFrontFile(null); setBackFile(null); setCapturedImage(null); }} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-center">📍 Tag this card?</h2>
            <p className="text-white/70 text-center text-sm">
              Met them at a conference or event? Tag it now so you can search for &quot;Who did I meet at GITEX?&quot; later.
            </p>
            <input 
              type="text" 
              placeholder="e.g. GITEX 2027, Tech Meetup..."
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-primary focus:outline-none transition-colors"
            />
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => frontFile && startProcessing(frontFile, backFile || undefined)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={() => frontFile && startProcessing(frontFile, backFile || undefined)}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
              >
                {eventName.trim() ? "Save & Process" : "Process"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (duplicateWarning) {
    return (
      <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <h2 className="text-2xl font-bold text-center text-orange-400">Duplicate Detected</h2>
          <p className="text-white/80 text-center text-sm">
            You already have a card for this {duplicateWarning.duplicate_reason}. What would you like to do?
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => {
                router.push(`/review/${duplicateWarning.new_card_id}?overwrite=${duplicateWarning.existing_card_id}`);
              }}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Update Existing Card
            </button>
            <button 
              onClick={async () => {
                await supabase.from("cards").delete().eq("id", duplicateWarning.new_card_id);
                setDuplicateWarning(null);
                setScanStep("front");
                setFrontFile(null);
                setBackFile(null);
                setCapturedImage(null);
              }}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
            >
              Discard New Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      {!isScanning && (
        <div className="flex justify-between items-center p-6 z-10">
          {scanStep === "front" ? (
            <Link href="/dashboard" className="p-2 bg-white/10 rounded-full backdrop-blur-md">
              <X className="w-6 h-6" />
            </Link>
          ) : (
            <button onClick={() => { setScanStep("back_prompt"); }} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
              <X className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium">{scanStep === "front" ? "AI Ready" : "Scan Back"}</span>
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
            <p className="text-sm font-medium text-white shadow-black drop-shadow-md bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
              {scanStep === "front" ? "Align front of card within frame" : "Align back of card within frame"}
            </p>
          </div>
        )}
      </div>

      {/* Controls - Hide during scanning */}
      {!isScanning && (
        <div className="p-8 pb-12 flex justify-between items-center bg-gradient-to-t from-black via-black/80 to-transparent z-10">
          <button
            onClick={() => galleryInputRef.current?.click()}
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
            onClick={() => cameraInputRef.current?.click()}
            className="p-4 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
