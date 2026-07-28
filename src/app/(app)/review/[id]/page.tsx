import { ChevronLeft, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Await the params object before using its properties in Next.js 15
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!card) {
    return (
      <div className="p-6 text-center mt-20">
        <h1 className="text-xl font-bold">Card Not Found</h1>
        <Link href="/dashboard" className="text-primary mt-4 inline-block">Go back home</Link>
      </div>
    );
  }

  const aiData = card.ai_metadata || {};
  let imageUrl = null;
  if (card.original_image_path) {
    const { data: urlData } = await supabase.storage
      .from('business-cards')
      .createSignedUrl(card.original_image_path, 3600);
    imageUrl = urlData?.signedUrl || null;
  }

  async function saveCard(formData: FormData) {
    "use server";
    const supabase = await createClient();
    
    // Convert comma separated socials back to array
    const socialsStr = formData.get("social_profiles") as string;
    const socialsArray = socialsStr ? socialsStr.split(',').map(s => s.trim()) : [];

    const { error } = await supabase
      .from('cards')
      .update({
        full_name: formData.get("full_name"),
        designation: formData.get("job_title"),
        company_name: formData.get("company_name"),
        emails: formData.get("email") ? [formData.get("email")] : [],
        phones: formData.get("phone") ? [formData.get("phone")] : [],
        website: formData.get("website"),
        address: formData.get("address") ? { text: formData.get("address") } : {},
        social_links: socialsArray.length > 0 ? { links: socialsArray } : {},
        processing_status: 'confirmed'
      })
      .eq('id', id);

    if (error) {
      console.error(error);
      throw new Error("Failed to save card");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-40">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Review Extract</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
           <Sparkles className="w-3 h-3" />
           HIGH CONFIDENCE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Original Card Preview */}
          <div className="w-full aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden border border-border shadow-inner relative">
            {imageUrl ? (
              <img src={imageUrl} alt="Business Card" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium text-sm">
                No Image Available
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-medium">
              ORIGINAL IMAGE
            </div>
          </div>

          <form action={saveCard} id="review-form" className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Personal Details</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input 
                  name="full_name"
                  type="text" 
                  defaultValue={card.full_name || aiData.full_name || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                <input 
                  name="job_title"
                  type="text" 
                  defaultValue={card.designation || aiData.job_title || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                <input 
                  name="company_name"
                  type="text" 
                  defaultValue={card.company_name || aiData.company_name || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Contact Info</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input 
                  name="email"
                  type="email" 
                  defaultValue={(card.emails && card.emails[0]) || aiData.email || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                <input 
                  name="phone"
                  type="text" 
                  defaultValue={(card.phones && card.phones[0]) || aiData.phone || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Website</label>
                <input 
                  name="website"
                  type="text" 
                  defaultValue={card.website || aiData.website || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                <input 
                  name="address"
                  type="text" 
                  defaultValue={(card.address as any)?.text || aiData.address || ""} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Social Profiles</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Links (comma separated)</label>
                <input 
                  name="social_profiles"
                  type="text" 
                  defaultValue={(card.social_links as any)?.links?.join(', ') || (aiData.social_profiles || []).join(', ')} 
                  className="w-full border-b border-border py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors bg-transparent"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-[72px] w-full max-w-md left-1/2 -translate-x-1/2 p-6 bg-white border-t border-border z-40 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button type="submit" form="review-form" className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors">
          <Check className="w-5 h-5" /> Save to Contacts
        </button>
      </div>
    </div>
  );
}
