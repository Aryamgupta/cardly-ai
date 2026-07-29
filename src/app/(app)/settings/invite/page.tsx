"use client";

import Link from "next/link";
import { ArrowLeft, Share2, Mail, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cardly.ai";
  
  // Untracked referral link for now
  const inviteLink = `${siteUrl}/signup?ref=friend`;

  const inviteMessage = `Hey! I've been using Cardly to scan and organize my business cards, and it's a total game-changer. \n\nIt uses AI to instantly extract contact details, infer locations, and save them straight to your phone.\n\nYou can join and try it out here: ${inviteLink}`;
  
  const emailSubject = "You've got to try this business card app";
  const emailBody = `Hey,\n\nI've been using Cardly to scan and organize my business cards, and it's a total game-changer. It uses AI to instantly extract contact details, infer locations, and save them straight to your phone.\n\nYou can join and try it out here:\n${inviteLink}\n\nCheers!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Cardly",
          text: inviteMessage,
        });
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="success"
            title="Shared Successfully"
            description="Thanks for spreading the word about Cardly!"
          />
        ));
      } catch (err) {
        // User likely cancelled the share sheet, do nothing
        console.log("Share cancelled or failed", err);
      }
    } else {
      // Fallback for browsers that don't support native share
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.custom((t) => (
      <CustomToast 
        id={t}
        variant="success"
        title="Link Copied"
        description="Invite link copied to your clipboard."
      />
    ));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 pb-24 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Invite Friends</h1>
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full mt-4 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <Share2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            Share the magic <br/> of Cardly
          </h2>
          <p className="text-slate-500 text-sm">
            Help your network ditch the paper clutter. Invite friends to seamlessly digitize their business connections.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full">
          {/* Native Share (Messages, WhatsApp, etc) */}
          <button 
            onClick={handleNativeShare}
            className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5" />
              <span>Share via Message</span>
            </div>
          </button>

          {/* Email Invite (mailto) */}
          <a 
            href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            className="w-full flex items-center justify-between p-4 bg-white border border-border text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-500" />
              <span>Send an Email</span>
            </div>
          </a>

          {/* Copy Link Fallback */}
          <button 
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-4 bg-white border border-border text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-500" />}
              <span>{copied ? "Copied!" : "Copy Invite Link"}</span>
            </div>
          </button>
        </div>
        
      </div>
    </div>
  );
}
