import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { updateContact } from "@/app/actions/contacts";
import { Card } from "@/types";
import { SubmitEditButton } from "./SubmitEditButton";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const card = data as Card | null;

  if (!card) {
    return notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateContact(id, formData);
    redirect(`/contacts/${id}?toast=edit-success`);
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col relative pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-border sticky top-0 z-10">
        <Link
          href={`/contacts/${id}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Cancel
        </Link>
        <h1 className="font-extrabold text-[#0B1020] text-lg">Edit Contact</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 p-6">
        <form id="edit-form" action={handleUpdate} className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input 
                name="full_name"
                type="text" 
                defaultValue={card.full_name || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
              <input 
                name="designation"
                type="text" 
                defaultValue={card.designation || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
              <input 
                name="company_name"
                type="text" 
                defaultValue={card.company_name || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Contact Details</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input 
                name="email"
                type="email" 
                defaultValue={card.emails?.[0] || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
              <input 
                name="phone"
                type="tel" 
                defaultValue={card.phones?.[0] || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Website</label>
              <input 
                name="website"
                type="text" 
                defaultValue={card.website || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <input 
                name="address"
                type="text" 
                defaultValue={card.address?.text || ""} 
                className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-[72px] w-full max-w-md left-1/2 -translate-x-1/2 p-6 bg-white border-t border-border z-40 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <SubmitEditButton />
      </div>
    </div>
  );
}
