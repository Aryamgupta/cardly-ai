import { ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CardImages } from "@/components/ui/CardImages";
import { DiscardButton } from "./DiscardButton";
import { enrichAndEmbedContact } from "@/services/ai/enrichContact";
import { ReviewForm } from "./ReviewForm";

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ overwrite?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Await the params object before using its properties in Next.js 15
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const overwriteId = resolvedSearchParams?.overwrite;

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

  // OPTIMIZED: Fetch both signed URLs in PARALLEL instead of sequentially
  const [frontResult, backResult] = await Promise.all([
    card.original_image_path
      ? supabase.storage.from('business-cards').createSignedUrl(card.original_image_path, 3600)
      : Promise.resolve({ data: null }),
    card.back_image_path
      ? supabase.storage.from('business-cards').createSignedUrl(card.back_image_path, 3600)
      : Promise.resolve({ data: null }),
  ]);
  const imageUrl = frontResult.data?.signedUrl || null;
  const backImageUrl = backResult.data?.signedUrl || null;

  async function saveCard(formData: FormData) {
    "use server";
    const supabase = await createClient();
    
    // Convert comma separated socials back to array
    const socialsStr = formData.get("social_profiles") as string;
    const socialsArray = socialsStr ? socialsStr.split(',').map(s => s.trim()) : [];
    
    const qrUrl = formData.get("qr_url") as string;
    const updatedAiMetadata = {
      ...(card!.ai_metadata || {}),
      qr_url: qrUrl || undefined
    };

    const contactData = {
      full_name: formData.get("full_name") as string,
      designation: formData.get("job_title") as string,
      company_name: formData.get("company_name") as string,
      emails: formData.get("email") ? [formData.get("email") as string] : [],
      phones: formData.get("phone") ? [formData.get("phone") as string] : [],
      website: formData.get("website") as string,
      address: formData.get("address") ? { text: formData.get("address") as string } : {},
      social_links: socialsArray.length > 0 ? { links: socialsArray } : {},
      ai_metadata: updatedAiMetadata,
      event_name: card!.event_name,
    };

    const overwriteIdInput = formData.get("overwrite_id") as string;
    const targetId = overwriteIdInput || id;

    const { error } = await supabase
      .from('cards')
      .update({
        ...contactData,
        processing_status: 'confirmed'
      })
      .eq('id', targetId);

    if (error) {
      console.error(error);
      throw new Error("Failed to save card");
    }
    
    if (overwriteIdInput && targetId !== id) {
      // Delete the duplicate draft card since we updated the existing one
      await supabase.from('cards').delete().eq('id', id);
    }

    // Fire enrichment as a background task — user is not blocked
    enrichAndEmbedContact(targetId, contactData)
      .catch(err => console.error('Enrichment failed for card:', targetId, err));
    revalidatePath("/", "layout");
    const name = formData.get("full_name") as string || "Contact";
    redirect(`/dashboard?toast=contact-saved&name=${encodeURIComponent(name)}`);
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
          
          {/* Card Images Preview (Front and Back) */}
          <CardImages frontUrl={imageUrl} backUrl={backImageUrl} />

          <ReviewForm card={card} overwriteId={overwriteId} saveCardAction={saveCard}>
            <DiscardButton cardId={id} />
          </ReviewForm>
          
        </div>
      </div>
    </div>
  );
}
