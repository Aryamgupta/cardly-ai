"use client";

import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewCardSchema } from "@/lib/validations";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { useRouter } from "next/navigation";

// Define an extended schema specifically for the review form since it has extra fields like qr_url and social_profiles
const extendedReviewSchema = reviewCardSchema.extend({
  qr_url: z.string().optional().nullable(),
  social_profiles: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type ReviewFormValues = z.infer<typeof extendedReviewSchema>;

interface ReviewFormProps {
  card: any;
  overwriteId?: string;
  saveCardAction: (formData: FormData) => Promise<void>;
  children?: React.ReactNode;
}

export function ReviewForm({ card, overwriteId, saveCardAction, children }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const aiData = card.ai_metadata || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(extendedReviewSchema),
    defaultValues: {
      full_name: card.full_name || aiData.full_name || "",
      designation: card.designation || aiData.job_title || "",
      company_name: card.company_name || aiData.company_name || "",
      emails: (card.emails && card.emails[0]) || aiData.email || "",
      phones: (card.phones && card.phones[0]) || aiData.phone || "",
      website: card.website || aiData.website || "",
      qr_url: card.ai_metadata?.qr_url || aiData.qr_url || "",
      address: (card.address)?.text || aiData.address || "",
      social_profiles: (card.social_links?.links || []).join(', ') || (aiData.social_profiles || []).join(', '),
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (overwriteId) formData.append("overwrite_id", overwriteId);
      formData.append("full_name", data.full_name);
      if (data.designation) formData.append("job_title", data.designation);
      if (data.company_name) formData.append("company_name", data.company_name);
      if (data.emails) formData.append("email", data.emails);
      if (data.phones) formData.append("phone", data.phones);
      if (data.website) formData.append("website", data.website);
      if (data.qr_url) formData.append("qr_url", data.qr_url);
      if (data.address) formData.append("address", data.address);
      if (data.social_profiles) formData.append("social_profiles", data.social_profiles);
      
      try {
        await saveCardAction(formData);
      } catch (error) {
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="error"
            title="Save Failed"
            description="Could not save the contact review."
          />
        ));
      }
    });
  };

  return (
    <>
      <form id="review-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Personal Details</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input 
              type="text" 
              {...register("full_name")}
              className={`w-full border-b ${errors.full_name ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
            <input 
              type="text" 
              {...register("designation")}
              className={`w-full border-b ${errors.designation ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.designation && (
              <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
            <input 
              type="text" 
              {...register("company_name")}
              className={`w-full border-b ${errors.company_name ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.company_name && (
              <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Contact Info</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input 
              type="email" 
              {...register("emails")}
              className={`w-full border-b ${errors.emails ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.emails && (
              <p className="text-red-500 text-xs mt-1">{errors.emails.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
            <input 
              type="text" 
              {...register("phones")}
              className={`w-full border-b ${errors.phones ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.phones && (
              <p className="text-red-500 text-xs mt-1">{errors.phones.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Website</label>
            <input 
              type="text" 
              {...register("website")}
              className={`w-full border-b ${errors.website ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.website && (
              <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">QR URL</label>
            <input 
              type="text" 
              {...register("qr_url")}
              className={`w-full border-b ${errors.qr_url ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.qr_url && (
              <p className="text-red-500 text-xs mt-1">{errors.qr_url.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
            <input 
              type="text" 
              {...register("address")}
              className={`w-full border-b ${errors.address ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Social Profiles</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Links (comma separated)</label>
            <input 
              type="text" 
              {...register("social_profiles")}
              className={`w-full border-b ${errors.social_profiles ? 'border-red-500' : 'border-border'} py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent`}
            />
            {errors.social_profiles && (
              <p className="text-red-500 text-xs mt-1">{errors.social_profiles.message}</p>
            )}
          </div>
        </div>
      </form>
      
      {/* Footer Action */}
      <div className="fixed bottom-[72px] w-full max-w-md left-1/2 -translate-x-1/2 p-6 bg-white border-t border-border z-40 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col gap-3">
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          {isPending ? "Saving..." : "Save to Contacts"}
        </button>
        {children}
      </div>
    </>
  );
}
