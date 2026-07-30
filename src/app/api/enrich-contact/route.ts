import { NextRequest, NextResponse } from "next/server";
import { enrichAndEmbedContact } from "@/services/ai/enrichContact";
import { createClient } from "@/utils/supabase/server";

// Internal endpoint — called fire-and-forget from the review/confirm flow.
// Secured by checking the Supabase session OR an internal secret header.
export async function POST(request: NextRequest) {
  try {
    // Accept requests from internal server actions (same origin) or with the cron secret
    const internalSecret = request.headers.get("x-internal-secret");
    const isInternal = internalSecret === process.env.CRON_SECRET;

    if (!isInternal) {
      // Fall back to checking the user session
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { cardId, contact } = body;

    if (!cardId) {
      return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
    }

    // Run enrichment (this is the potentially slow part — Gemini calls)
    await enrichAndEmbedContact(cardId, contact || {});

    return NextResponse.json({ success: true, cardId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/enrich-contact] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
