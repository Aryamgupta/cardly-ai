import {
  ArrowLeft,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Sparkles,
  Maximize2,
  AtSign,
  MapPin,
  Building2,
  AlignLeft,
  Smartphone,
  MessageCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TestButton } from "./TestButton";
import { SaveContactButton } from "./SaveContactButton";
import { ShareContactButton } from "./ShareContactButton";
import { CopyableField } from "./CopyableField";
import { InteractiveNotes } from "./InteractiveNotes";
import { DeleteContactButton } from "./DeleteContactButton";
import { Card } from "@/types";
import { CardImages } from "@/components/ui/CardImages";
import { FollowUpSection } from "./FollowUpSection";

export default async function ContactProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // OPTIMIZED: Fetch both signed URLs in PARALLEL instead of sequentially
  const [frontResult, backResult] = await Promise.all([
    card.original_image_path
      ? supabase.storage.from("business-cards").createSignedUrl(card.original_image_path, 3600)
      : Promise.resolve({ data: null }),
    card.back_image_path
      ? supabase.storage.from("business-cards").createSignedUrl(card.back_image_path, 3600)
      : Promise.resolve({ data: null }),
  ]);
  const imageUrl = frontResult.data?.signedUrl || null;
  const backImageUrl = backResult.data?.signedUrl || null;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.full_name || "Unknown")}&background=random&color=fff&size=150`;

  const email = card.emails && card.emails.length > 0 ? card.emails[0] : null;
  const phone = card.phones && card.phones.length > 0 ? card.phones[0] : null;
  const addressText = card.address?.text || null;
  const addressCoords = card.address?.coordinates || null;
  const mapQuery = addressCoords
    ? `${addressCoords.lat},${addressCoords.lng}`
    : addressText;
  const notes = card.notes || "No notes available.";

  async function deleteContact() {
    "use server";
    const supabase = await createClient();
    await supabase.from("cards").delete().eq("id", id);
    redirect("/contacts");
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link
          href="/contacts"
          className="flex items-center gap-2 text-primary font-bold"
        >
          <ArrowLeft className="w-6 h-6" /> Cardly AI
        </Link>
        <div className="flex items-center gap-4 text-foreground">
          {card.original_image_path && (
            <TestButton
              cardId={card.id}
              originalPath={card.original_image_path}
            />
          )}
          <Link href={`/contacts/${card.id}/edit`} className="hover:text-primary transition-colors">
            <Edit2 className="w-5 h-5" />
          </Link>
          <form action={deleteContact}>
            <DeleteContactButton />
          </form>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-6 pt-2 pb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-slate-200">
          <img
            src={avatarUrl}
            alt={card.full_name || "Contact"}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B1020] mb-1">
          {card.full_name || "Unknown Contact"}
        </h1>

        {card.designation && (
          <p className="text-lg text-primary font-medium text-center mb-3">
            {card.designation}{" "}
            {card.company_name ? `@ ${card.company_name}` : ""}
          </p>
        )}

        {/* We can hide these tags or generate them dynamically later */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {(card.ai_metadata?.tags || []).map((tag: string, index: number) => {
            const hash = tag
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const tagColors = [
              "bg-blue-100 text-blue-700",
              "bg-emerald-100 text-emerald-700",
              "bg-amber-100 text-amber-700",
              "bg-violet-100 text-violet-700",
              "bg-rose-100 text-rose-700",
              "bg-cyan-100 text-cyan-700",
            ];
            const colorClass = tagColors[hash % tagColors.length];
            return (
              <span
                key={index}
                className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 px-6 mb-3">
        <a
          href={phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "#"}
          className={`flex flex-col items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl shadow-sm transition-colors ${!phone ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-primary/90"}`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs font-medium">Call</span>
        </a>
        <a
          href={email ? `mailto:${email}` : "#"}
          className={`flex flex-col items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl shadow-sm transition-colors ${!email ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-primary/20"}`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-xs font-medium">Email</span>
        </a>
        {(() => {
          const hasWhatsapp = card.ai_metadata?.has_whatsapp === true;
          if (hasWhatsapp) {
            return (
              <a
                href={
                  phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, "")}` : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-xl shadow-sm transition-colors ${!phone ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-[#25D366]/20"}`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">WhatsApp</span>
              </a>
            );
          }
          return (
            <a
              href={phone ? `sms:${phone.replace(/[^0-9+]/g, "")}` : "#"}
              className={`flex flex-col items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl shadow-sm transition-colors ${!phone ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-primary/20"}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Message</span>
            </a>
          );
        })()}
        {(() => {
          const linkedInUrl =
            card.social_links?.links?.find((link: string) =>
              link.toLowerCase().includes("linkedin"),
            ) || card.social_links?.links?.[0];
          return (
            <a
              href={linkedInUrl || "#"}
              target={linkedInUrl ? "_blank" : undefined}
              rel={linkedInUrl ? "noopener noreferrer" : undefined}
              className={`flex flex-col items-center justify-center gap-2 py-3 bg-white border border-border text-foreground rounded-xl shadow-sm transition-colors ${!linkedInUrl ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-slate-50"}`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="text-xs font-medium">LinkedIn</span>
            </a>
          );
        })()}
      </div>

      <div className="px-6 mb-6 flex flex-col gap-3">
        <SaveContactButton id={id} />
        <ShareContactButton card={card} />
      </div>

      <FollowUpSection
        cardId={card.id}
        initialDate={card.follow_up_date}
        initialStatus={card.follow_up_status}
      />

      {/* AI Insights */}
      <div className="px-6 mb-6">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-secondary text-xs font-bold tracking-wider mb-3 uppercase">
            <Sparkles className="w-4 h-4" /> AI Insights
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            {card.ai_metadata?.summary ||
              "AI extraction complete. More insights will be available soon."}
          </p>

          {card.ai_metadata?.qr_url && (
            <a 
              href={card.ai_metadata.qr_url.startsWith('http') ? card.ai_metadata.qr_url : `https://${card.ai_metadata.qr_url}`}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-2 mb-4 px-3 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Extracted QR Link</span>
            </a>
          )}

          {/* Static tags for now */}
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-secondary/5 text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>{" "}
              SCANNED
            </span>
          </div>
        </div>
      </div>

      {/* Original Card */}
      <div className="px-6 mb-6">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Original Card
            </h3>
          </div>
          <CardImages frontUrl={imageUrl} backUrl={backImageUrl} />
        </div>
      </div>

      {/* Information Details */}
      <div className="px-6 mb-6">
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-slate-50/50">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Information Details
            </h3>
          </div>

          <div className="divide-y divide-border">
            <CopyableField
              icon={<AtSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
              label="Email Address"
              value={email}
              subValue={email ? "Primary" : undefined}
              href={email ? `mailto:${email}` : undefined}
            />

            <CopyableField
              icon={<Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
              label="Phone Number"
              value={phone}
              subValue={phone ? "Primary" : undefined}
              href={phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : undefined}
            />

            <CopyableField
              icon={<Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
              label="Website"
              value={card.website}
              href={card.website ? (card.website.startsWith('http') ? card.website : `https://${card.website}`) : undefined}
            />

            <CopyableField
              icon={<Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
              label="Company & Title"
              value={card.company_name}
              subValue={card.designation}
            />

            <div className="p-4 flex gap-4">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="font-medium text-foreground text-sm leading-snug mb-3">
                  {addressText || "Not provided"}
                </p>

                {addressText && mapQuery && (
                  <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden relative border border-border mt-2">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen
                      aria-hidden="false"
                      tabIndex={0}
                      title="Contact Location"
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 flex gap-4">
              <AlignLeft className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Notes
                </p>
                <div className="pt-1">
                  <InteractiveNotes id={id} initialNotes={card.notes || ""} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
