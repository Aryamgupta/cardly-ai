"use client";

import Link from "next/link";
import { ChevronLeft, HelpCircle, ChevronDown, Mail, Send, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { submitSupportRequest } from "@/app/actions/support";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supportSchema } from "@/lib/validations";
import { z } from "zod";

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
  },
  {
    question: "How do I clean up empty or failed scans?",
    answer: "You can go to Settings > Data Management and click 'Clean Up Empty Cards'. This will queue a background task to safely delete any cards where the scan failed or the primary details are completely empty. You will receive a notification when it's done."
  }
];

type SupportFormValues = z.infer<typeof supportSchema>;

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
  });

  const messageValue = watch("message", "");

  const handleSupportSubmit = (data: SupportFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("message", data.message);
      
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
        reset();
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
          
          <form onSubmit={handleSubmit(handleSupportSubmit)} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">How can we help?</label>
              <textarea
                {...register("message")}
                placeholder="Describe your issue or ask a question..."
                disabled={isPending}
                rows={4}
                maxLength={1000}
                className={`w-full bg-slate-50 border ${errors.message ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <div className="flex justify-between items-start mt-1">
                <p className="text-red-500 text-xs">{errors.message?.message}</p>
                <span className="text-xs text-muted-foreground ml-auto">{messageValue.length}/1000</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                disabled={isPending || messageValue.trim().length === 0}
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
