"use client";

import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateContact } from "@/app/actions/contacts";
import { Card } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editContactSchema } from "@/lib/validations";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { useRouter } from "next/navigation";

type EditContactValues = z.infer<typeof editContactSchema>;

interface EditContactFormProps {
  card: Card;
}

export function EditContactForm({ card }: EditContactFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditContactValues>({
    resolver: zodResolver(editContactSchema),
    defaultValues: {
      full_name: card.full_name || "",
      designation: card.designation || "",
      company_name: card.company_name || "",
      emails: card.emails?.[0] || "",
      phones: card.phones?.[0] || "",
      website: card.website || "",
      // Address is not in editContactSchema currently, so I'll omit it or add it if needed
      // but let's stick to the schema fields.
    },
  });

  const onSubmit = (data: EditContactValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      if (data.designation) formData.append("designation", data.designation);
      if (data.company_name) formData.append("company_name", data.company_name);
      if (data.emails) formData.append("email", data.emails);
      if (data.phones) formData.append("phone", data.phones);
      if (data.website) formData.append("website", data.website);

      try {
        await updateContact(card.id, formData);
        router.push(`/contacts/${card.id}?toast=edit-success`);
      } catch (error: any) {
        toast.custom((t) => (
          <CustomToast 
            id={t}
            variant="error"
            title="Update Failed"
            description={error.message || "Something went wrong"}
          />
        ));
      }
    });
  };

  return (
    <div className="flex-1 p-6">
      <form id="edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h2>
          
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
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Contact Details</h2>
          
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
              type="tel" 
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
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-[72px] w-full max-w-md left-1/2 -translate-x-1/2 p-6 bg-white border-t border-border z-40 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
