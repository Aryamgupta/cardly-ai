"use client";

import Link from "next/link";
import { ChevronLeft, HelpCircle, ChevronDown, Mail, Send, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { submitSupportRequest } from "@/app/actions/support";

const FAQS = [
  {
    question: "How does the AI metadata enrichment work?",
    answer: "Our AI scans the business card image using optical character recognition (OCR) and natural language processing to extract the name, designation, company, and contact details automatically."
  },
  {
    question: "Can I export my scanned contacts?",
    answer: "Yes, you can export your contacts to CSV from the Privacy & Security tab in Settings."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption and strict row-level security policies in our database. Your contacts are only visible to you."
  }
];

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("message", message);
      
      const result = await submitSupportRequest(formData);
      
      if (result.error) {
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="error"
            title="Send Failed"
            description={result.error}
          />
        ));
      } else {
        setMessage("");
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="success"
            title="Message Sent"
            description="Your support request has been sent to our developer team."
          />
        ));
      }
    });
  };

  return (
    <div className="flex-1 pb-24 md:pb-6 relative w-full pt-6 font-sans">
      <div className="px-6 mb-6">
        <Link href="/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground">Get assistance and read FAQs.</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto">
        
        {/* FAQs */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-1">Quick answers to common questions.</p>
          </div>
          <div className="divide-y divide-border">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-1">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Contact Support</h2>
            <p className="text-sm text-muted-foreground mt-1">Need more help? Send us a message.</p>
          </div>
          
          <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">How can we help?</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or ask a question..."
                required
                disabled={isPending}
                rows={4}
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                disabled={isPending || !message.trim()}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
