import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enrichAndEmbedContact } from "@/services/ai/enrichContact";

// Setup admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 10;
const DELAY_MS = 2000;

export async function POST(request: NextRequest) {
  try {
    // Basic protection - require CRON_SECRET or an authenticated user
    let isAuthorized = false;
    
    // Check cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      isAuthorized = true;
    }
    
    // Check user session
    let userId = null;
    if (!isAuthorized) {
      // Need to use the regular client to check session
      const { createClient: createServerClient } = await import("@/utils/supabase/server");
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthorized = true;
        userId = user.id; // If triggered by user, only backfill their contacts
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find cards that are confirmed but have no embedding
    let query = supabaseAdmin
      .from("cards")
      .select("*")
      .eq("processing_status", "confirmed")
      .is("embedding", null)
      .order("created_at", { ascending: false });
      
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: cardsToProcess, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!cardsToProcess || cardsToProcess.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No cards need backfilling" });
    }

    // This is meant to be called and left to run in the background (fire and forget from client)
    // For Vercel/serverless we should theoretically return quickly, but NextJS allows background work if not using Edge
    
    // Process in batches
    console.log(`[Backfill] Starting backfill for ${cardsToProcess.length} cards`);
    
    const processAll = async () => {
      for (let i = 0; i < cardsToProcess.length; i += BATCH_SIZE) {
        const batch = cardsToProcess.slice(i, i + BATCH_SIZE);
        console.log(`[Backfill] Processing batch ${i / BATCH_SIZE + 1} (${batch.length} cards)`);
        
        await Promise.all(
          batch.map(async (card) => {
            try {
              // Construct contact data similar to what review page does
              const contactData = {
                full_name: card.full_name,
                designation: card.designation,
                company_name: card.company_name,
                emails: card.emails,
                website: card.website,
                address: card.address,
                notes: card.notes,
                ai_metadata: card.ai_metadata,
              };
              
              await enrichAndEmbedContact(card.id, contactData);
            } catch (err) {
              console.error(`[Backfill] Error processing card ${card.id}:`, err);
            }
          })
        );

        // Delay between batches to respect rate limits
        if (i + BATCH_SIZE < cardsToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }
      console.log(`[Backfill] Completed backfill for ${cardsToProcess.length} cards`);
    };

    // Start background processing
    processAll().catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: `Started backfill for ${cardsToProcess.length} cards in the background.` 
    });

  } catch (err) {
    console.error("[Backfill API Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
