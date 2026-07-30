import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Aggregate network data from Supabase
    const { data: aggregates, error: aggError } = await supabase
      .from("cards")
      .select("ai_industry, ai_seniority")
      .eq("user_id", user.id)
      .eq("processing_status", "confirmed")
      .not("ai_industry", "is", null);

    if (aggError) {
      console.error("[Network Summary] DB error:", aggError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!aggregates || aggregates.length === 0) {
      return new Response(
        "You don't have enough enriched contacts yet to summarize your network.",
        { status: 200 },
      );
    }

    // Process aggregates
    const industryCounts: Record<string, number> = {};
    const seniorityCounts: Record<string, number> = {};

    aggregates.forEach((row) => {
      if (row.ai_industry) {
        industryCounts[row.ai_industry] =
          (industryCounts[row.ai_industry] || 0) + 1;
      }
      if (row.ai_seniority) {
        seniorityCounts[row.ai_seniority] =
          (seniorityCounts[row.ai_seniority] || 0) + 1;
      }
    });

    // 2. Call Gemini for the summary
    const prompt = `
You are an AI assistant analyzing a professional network. Here is the aggregate data of this user's contacts:

Total contacts: ${aggregates.length}

Industries:
${Object.entries(industryCounts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Seniority levels:
${Object.entries(seniorityCounts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Write a conversational, insightful summary of this person's network (max 3-4 sentences). Point out their strongest industries and the general makeup of their network. Do NOT use markdown formatting (no bold/italics), just plain text. Make it sound enthusiastic but professional.
    `;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    // 3. Transform Gemini's chunked SSE response into a clean text stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // We are reading the stream from Gemini
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        // The Gemini streamGenerateContent returns JSON arrays starting with [ or ,
        // It's a bit tricky to parse raw SSE chunks manually.
        // Let's use a simple regex to extract text fields from the raw JSON chunks.
        const matches = text.matchAll(/"text":\s*"([^"]+)"/g);
        for (const match of matches) {
          // Unescape newlines and quotes
          const unescaped = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          controller.enqueue(encoder.encode(unescaped));
        }
      },
    });

    return new Response(res.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("[Network Summary] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
