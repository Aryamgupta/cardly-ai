import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
  
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }
  
  const data = await res.json();
  const values = data?.embedding?.values as number[] | undefined;
  if (!values || values.length === 0) throw new Error("Empty embedding returned");
  return values;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, threshold = 0.55, limit = 10 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    // 1. Embed the search query
    const queryEmbedding = await callGeminiEmbed(query);
    const queryEmbeddingString = `[${queryEmbedding.join(",")}]`;

    // 2. Call the secure pgvector RPC function
    const { data: matches, error: rpcError } = await supabase.rpc('search_contacts', {
      query_embedding: queryEmbeddingString,
      match_threshold: threshold,
      match_count: limit,
      p_user_id: user.id
    });

    if (rpcError) {
      console.error("[Search API] RPC Error:", rpcError);
      throw new Error("Database search failed");
    }

    // 3. Batch-fetch signed image URLs (same pattern as contacts/page.tsx)
    let processedMatches = matches || [];
    const pathsToSign = processedMatches
      .filter((m: any) => m.original_image_path)
      .map((m: any) => m.original_image_path as string);

    let signedUrlMap: Record<string, string> = {};
    if (pathsToSign.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from("business-cards")
        .createSignedUrls(pathsToSign, 3600);
      if (signedUrls) {
        signedUrls.forEach((item) => {
          if (item.signedUrl && item.path) {
            // Supabase returns path without leading slash; DB may store with or without
            signedUrlMap[item.path] = item.signedUrl;
            signedUrlMap["/" + item.path] = item.signedUrl; // cover both variants
          }
        });
      }
    }

    processedMatches = processedMatches.map((match: any) => ({
      ...match,
      image_url: match.original_image_path
        ? signedUrlMap[match.original_image_path] ||
          signedUrlMap[match.original_image_path.replace(/^\//, "")] ||
          null
        : null,
    }));

    return NextResponse.json({ results: processedMatches });
  } catch (err) {
    console.error("[Search API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
