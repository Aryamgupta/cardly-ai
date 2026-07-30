import { createClient } from "@supabase/supabase-js";

// Use admin client — this runs as a background task with no active user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContactData {
  full_name?: string | null;
  company_name?: string | null;
  designation?: string | null;
  emails?: string[] | null;
  website?: string | null;
  address?: { text?: string } | null;
  notes?: string | null;
  event_name?: string | null;
  ai_metadata?: { tags?: string[]; summary?: string } | null;
}

interface EnrichmentResult {
  ai_industry: string;
  ai_seniority: string;
  ai_keywords: string[];
  ai_summary: string;
}

async function callGeminiGenerate(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

async function callGeminiEmbed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,  // Matryoshka truncation — matches VECTOR(768) in DB
      }),
    }
  );
  const data = await res.json();
  const values = data?.embedding?.values as number[] | undefined;
  if (!values || values.length === 0) throw new Error("Empty embedding returned");
  return values;
}

export async function enrichAndEmbedContact(
  cardId: string,
  contact: ContactData
): Promise<void> {
  try {
    // ── Step 1: Build context string from available card data ──────────────────
    const contextParts = [
      contact.full_name && `Name: ${contact.full_name}`,
      contact.designation && `Title: ${contact.designation}`,
      contact.company_name && `Company: ${contact.company_name}`,
      contact.emails?.[0] && `Email: ${contact.emails[0]}`,
      contact.website && `Website: ${contact.website}`,
      contact.address?.text && `Location: ${contact.address.text}`,
      contact.notes && `Notes: ${contact.notes}`,
      contact.ai_metadata?.tags?.length && `Tags: ${contact.ai_metadata.tags.join(", ")}`,
      contact.ai_metadata?.summary && `Card Summary: ${contact.ai_metadata.summary}`,
    ]
      .filter(Boolean)
      .join("\n");

    const enrichmentPrompt = `
You are analyzing a professional contact from a business card. Based on the information below, generate structured metadata optimized for semantic search.

Contact Information:
${contextParts}

Return a JSON object with EXACTLY these fields:
{
  "ai_industry": "The specific industry sector (e.g. 'Artificial Intelligence', 'Fintech', 'Healthcare', 'Manufacturing', 'Real Estate', 'EdTech', 'SaaS')",
  "ai_seniority": "One of exactly: 'Executive', 'Senior', 'Mid-level', 'Entry-level', 'Founder', 'Individual Contributor'",
  "ai_keywords": ["5 to 8 relevant keywords for semantic search, e.g. 'B2B Sales', 'Machine Learning', 'Venture Capital'"],
  "ai_summary": "A 2-3 sentence professional summary inferring what this person likely does, who they serve, and what topics they probably care about."
}

Return ONLY the JSON object with no additional text or markdown.`;

    // ── Step 2: Call Gemini for structured enrichment ──────────────────────────
    const enrichmentText = await callGeminiGenerate(enrichmentPrompt);
    let enrichment: EnrichmentResult;
    try {
      enrichment = JSON.parse(enrichmentText);
    } catch {
      console.error(`[enrichContact] Failed to parse enrichment JSON for card ${cardId}:`, enrichmentText);
      return;
    }

    // ── Step 3: Build rich text blob for embedding ─────────────────────────────
    const embeddingText = [
      `${contact.full_name} is a ${contact.designation || "professional"} at ${contact.company_name || "a company"}.`,
      enrichment.ai_summary,
      `Industry: ${enrichment.ai_industry}.`,
      `Seniority level: ${enrichment.ai_seniority}.`,
      `Keywords: ${enrichment.ai_keywords?.join(", ")}.`,
      contact.address?.text && `Location: ${contact.address.text}.`,
      contact.notes && `Meeting context: ${contact.notes}.`,
      contact.event_name && `Met at: ${contact.event_name}.`,
      contact.ai_metadata?.summary && `Card description: ${contact.ai_metadata.summary}.`,
    ]
      .filter(Boolean)
      .join(" ");

    // ── Step 4: Generate 768-dim embedding vector ──────────────────────────────
    const embedding = await callGeminiEmbed(embeddingText);

    // ── Step 5: Persist everything to the database ────────────────────────────
    const { error } = await supabaseAdmin
      .from("cards")
      .update({
        ai_summary: enrichment.ai_summary,
        ai_industry: enrichment.ai_industry,
        ai_seniority: enrichment.ai_seniority,
        ai_keywords: enrichment.ai_keywords,
        embedding: `[${embedding.join(",")}]`,
        embedding_generated_at: new Date().toISOString(),
      })
      .eq("id", cardId);

    if (error) {
      console.error(`[enrichContact] DB save failed for card ${cardId}:`, error);
    } else {
      console.log(`[enrichContact] ✅ Card ${cardId} enriched — ${enrichment.ai_industry} / ${enrichment.ai_seniority}`);
    }
  } catch (err) {
    console.error(`[enrichContact] ❌ Failed for card ${cardId}:`, err);
    throw err;
  }
}
