import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!card) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const nameParts = (card.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const email = card.emails?.[0] || "";
  const phone = card.phones?.[0] || "";
  const company = card.company_name || "";
  const title = card.designation || "";
  const website = card.website || "";

  // Build vCard string
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${card.full_name || ""}
ORG:${company}
TITLE:${title}
TEL;TYPE=CELL:${phone}
EMAIL;TYPE=WORK:${email}
URL:${website}
END:VCARD`;

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `inline; filename="${card.full_name ? card.full_name.replace(/\s+/g, '_') : 'contact'}.vcf"`,
    },
  });
}
