import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { getAvatar } from "@/utils/common/common";
import { Avatar } from "../ui/Common/Avatar";

export async function AIRecommendation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get a contact to recommend reconnecting with
  // We'll pick a confirmed contact that hasn't been updated recently (e.g. oldest updated_at)
  const { data: contacts } = await supabase
    .from("cards")
    .select(
      "id, full_name, company_name, designation, original_image_path, updated_at",
    )
    .eq("user_id", user.id)
    .eq("processing_status", "confirmed")
    .order("updated_at", { ascending: true })
    .limit(1);

  const contact = contacts?.[0];

  if (!contact) return null;

  // Get signed URL for the image if it exists
  let imageUrl = null;
  if (contact.original_image_path) {
    const { data } = await supabase.storage
      .from("business-cards")
      .createSignedUrl(contact.original_image_path, 3600);
    imageUrl = data?.signedUrl;
  }

  return (
    <div className="border border-border rounded-xl p-5 mb-6 bg-gradient-to-br from-indigo-50 to-white shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-primary">
            Smart Suggestion
          </h2>
        </div>

        <p className="text-slate-600 text-sm mb-4">
          You haven&lsquo;t been in touch with{" "}
          <strong>{contact.full_name}</strong> in a while. Would you like to
          reconnect?
        </p>

        <Link
          href={`/contacts/${contact.id}`}
          className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:border-primary/30 hover:shadow transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden relative flex-shrink-0">
            <Avatar fullname={contact.full_name} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {contact.full_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {contact.designation && <span>{contact.designation}</span>}
              {contact.designation && contact.company_name && " @ "}
              {contact.company_name}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0 mr-2" />
        </Link>
      </div>
    </div>
  );
}
