/**
 * scripts/seed_vectors.ts
 * Backfills AI enrichment + vector embeddings for all confirmed cards.
 * Uses plain fetch() — no SDK, no WebSocket, works on Node 18/20/22+.
 *
 * Run with: npx tsx scripts/seed_vectors.ts
 */
import * as dotenv from "dotenv";
import * as fs from "fs";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_GEMINI_KEY    = process.env.SEED_GEMINI_KEY;

// Tune these to match your API tier (free tier defaults)
const GENERATE_RPM = Number(process.env.GEMINI_GENERATE_RPM || 8);
const EMBED_RPM    = Number(process.env.GEMINI_EMBED_RPM    || 8);
const MAX_RETRIES  = 5;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SEED_GEMINI_KEY) {
  console.error("❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_GEMINI_KEY");
  process.exit(1);
}

// ── Supabase REST ─────────────────────────────────────────────────────────────

const supabaseHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function fetchCardsToEnrich() {
  const url = `${SUPABASE_URL}/rest/v1/cards?processing_status=eq.confirmed&embedding=is.null&select=id,full_name,designation,company_name,emails,website,address,notes,ai_metadata`;
  const res = await fetch(url, { headers: supabaseHeaders });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${await res.text()}`);
  return res.json() as Promise<any[]>;
}

async function updateCard(cardId: string, payload: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/cards?id=eq.${cardId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...supabaseHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Supabase update failed: ${await res.text()}`);
}

// ── Rate gate ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class RateGate {
  private lastAt = 0;
  constructor(private minMs: number) {}
  async wait() {
    const wait = this.minMs - (Date.now() - this.lastAt);
    if (wait > 0) await sleep(wait);
    this.lastAt = Date.now();
  }
}

const generateGate = new RateGate(Math.ceil(60000 / GENERATE_RPM));
const embedGate    = new RateGate(Math.ceil(60000 / EMBED_RPM));

class QuotaExhaustedError extends Error {}

async function parse429(res: Response) {
  let body: any = {};
  try { body = await res.json(); } catch {}
  const details: any[] = body?.error?.details || [];
  const retryDelay = details.find((d) => d.retryDelay)?.retryDelay;
  const quotaId: string = details.find((d) => d.violations)?.violations?.[0]?.quotaId || "";
  const message: string = body?.error?.message || "";
  const isDaily = /PerDay|RPD/i.test(quotaId);
  const isZeroAllowance = /limit:\s*0\b/i.test(message);
  const retryMs = retryDelay ? (parseInt(retryDelay, 10) + 5) * 1000 : 35000;
  return { retryMs, isDaily, isZeroAllowance, raw: body?.error };
}

// ── Gemini helpers ────────────────────────────────────────────────────────────

async function callGeminiGenerate(prompt: string, attempt = 1): Promise<string> {
  await generateGate.wait();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${SEED_GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (res.status === 429) {
    const { retryMs, isDaily, isZeroAllowance, raw } = await parse429(res);
    if (isZeroAllowance || isDaily) {
      throw new QuotaExhaustedError(`Quota exhausted: ${raw?.message || "daily cap hit"}`);
    }
    if (attempt > MAX_RETRIES) throw new Error(`Rate limited after ${MAX_RETRIES} retries`);
    process.stdout.write(` [429 — waiting ${Math.round(retryMs / 1000)}s]`);
    await sleep(retryMs);
    return callGeminiGenerate(prompt, attempt + 1);
  }
  if (!res.ok) {
    const b = await res.json() as any;
    throw new Error(`Gemini generate error: ${b?.error?.message || res.statusText}`);
  }
  const data = await res.json() as any;
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : "{}";
}

async function callGeminiEmbed(text: string, attempt = 1): Promise<number[]> {
  await embedGate.wait();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${SEED_GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,   // Matryoshka truncation — keeps quality, fits pgvector limit
      }),
    }
  );

  if (res.status === 429) {
    const { retryMs, isDaily, isZeroAllowance, raw } = await parse429(res);
    if (isZeroAllowance || isDaily) {
      throw new QuotaExhaustedError(`Embed quota exhausted: ${raw?.message || "daily cap hit"}`);
    }
    if (attempt > MAX_RETRIES) throw new Error(`Embed rate limited after ${MAX_RETRIES} retries`);
    process.stdout.write(` [429 embed — waiting ${Math.round(retryMs / 1000)}s]`);
    await sleep(retryMs);
    return callGeminiEmbed(text, attempt + 1);
  }
  if (!res.ok) {
    const err = await res.json() as any;
    throw new Error(`Gemini embed error: ${err?.error?.message || JSON.stringify(err?.error)}`);
  }
  const data = await res.json() as any;
  const values = data?.embedding?.values as number[] | undefined;
  if (!values || values.length === 0) throw new Error("Empty embedding returned");
  return values;
}

// ── Enrichment prompt ─────────────────────────────────────────────────────────

function buildPrompt(card: any): string {
  const fields = [
    card.full_name        && `Name: ${card.full_name}`,
    card.designation      && `Title: ${card.designation}`,
    card.company_name     && `Company: ${card.company_name}`,
    card.emails?.[0]      && `Email: ${card.emails[0]}`,
    card.website          && `Website: ${card.website}`,
    card.address?.text    && `Location: ${card.address.text}`,
    card.notes            && `Notes: ${card.notes}`,
    card.ai_metadata?.summary && `Summary from card: ${card.ai_metadata.summary}`,
  ].filter(Boolean).join("\n");

  return `You are a professional network intelligence assistant.
Analyze this business card contact and return a JSON object.

${fields}

Respond with ONLY a raw JSON object (no markdown, no code fences) in this exact structure:
{
  "ai_industry": "string — the industry sector this person works in (e.g. Software, Healthcare, Finance, Real Estate, Education, Manufacturing, Consulting)",
  "ai_seniority": "string — MUST be exactly one of: Executive, Senior, Mid-level, Entry-level, Founder, Individual Contributor",
  "ai_keywords": ["array", "of", "5", "relevant", "keywords"],
  "ai_summary": "string — 2 sentences describing what this person likely does and who they serve"
}`;
}

// ── Core logic ────────────────────────────────────────────────────────────────

async function enrichCard(card: any) {
  const prompt = buildPrompt(card);
  const enrichmentText = await callGeminiGenerate(prompt);

  let enrichment: any;
  try {
    enrichment = JSON.parse(enrichmentText);
  } catch {
    throw new Error(`JSON parse failed: ${enrichmentText.slice(0, 120)}`);
  }

  // Validate that we got real values (not template placeholders or nulls)
  if (!enrichment.ai_industry || enrichment.ai_industry.includes("<")) {
    throw new Error(`Bad enrichment response — ai_industry is null/placeholder: "${enrichment.ai_industry}"`);
  }

  const embeddingBlob = [
    `${card.full_name} works as ${card.designation || "a professional"} at ${card.company_name || "a company"}.`,
    enrichment.ai_summary,
    `Industry: ${enrichment.ai_industry}.`,
    `Seniority: ${enrichment.ai_seniority}.`,
    `Keywords: ${Array.isArray(enrichment.ai_keywords) ? enrichment.ai_keywords.join(", ") : enrichment.ai_keywords}.`,
    card.address?.text && `Location: ${card.address.text}.`,
    card.notes         && `Notes: ${card.notes}.`,
  ].filter(Boolean).join(" ");

  const embedding = await callGeminiEmbed(embeddingBlob);

  await updateCard(card.id, {
    ai_summary:   enrichment.ai_summary,
    ai_industry:  enrichment.ai_industry,
    ai_seniority: enrichment.ai_seniority,
    ai_keywords:  Array.isArray(enrichment.ai_keywords) ? enrichment.ai_keywords : [],
    embedding:    `[${embedding.join(",")}]`,
    embedding_generated_at: new Date().toISOString(),
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Cardly Vector Seeder\n");

  const cards = await fetchCardsToEnrich();

  if (cards.length === 0) {
    console.log("✅ All confirmed cards already have embeddings. Nothing to do!");
    process.exit(0);
  }

  console.log(`📇 Found ${cards.length} card(s) to process.\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    process.stdout.write(`[${i + 1}/${cards.length}] ${card.full_name || card.id} ...`);
    try {
      await enrichCard(card);
      console.log(" ✅");
      success++;
    } catch (err: any) {
      if (err instanceof QuotaExhaustedError) {
        console.log(`\n\n🛑 ${err.message}`);
        console.log(`   ${success} card(s) done. Re-run later — already-enriched cards are skipped.`);
        process.exit(2);
      }
      console.log(` ❌  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🏁 Done — ✅ ${success} succeeded  ❌ ${failed} failed`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});