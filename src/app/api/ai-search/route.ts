import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";

interface SearchContactMatch {
  id: string;
  full_name: string | null;
  designation: string | null;
  company_name: string | null;
  original_image_path: string | null;
  similarity: number;
  [key: string]: unknown;
}

interface ProcessedContactMatch extends SearchContactMatch {
  image_url: string | null;
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
    let processedMatches: ProcessedContactMatch[] = matches || [];
    const pathsToSign = processedMatches
      .filter((m: SearchContactMatch) => m.original_image_path)
      .map((m: SearchContactMatch) => m.original_image_path as string);

    const signedUrlMap: Record<string, string> = {};
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

    processedMatches = processedMatches.map((match: SearchContactMatch) => ({
      ...match,
      image_url: match.original_image_path
        ? signedUrlMap[match.original_image_path] ||
          signedUrlMap[match.original_image_path.replace(/^\//, "")] ||
          null
        : null,
    }));

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        await writer.write(encoder.encode(JSON.stringify({ type: 'contacts', results: processedMatches }) + "\n"));

        if (processedMatches.length > 0) {
          const prompt = `
You are an AI assistant for a smart Rolodex. The user searched for: "${query}".
Here are the top matches found:
${processedMatches.map((m: ProcessedContactMatch, i: number) => `${i+1}. ${m.full_name} - ${m.designation || 'Unknown Title'} at ${m.company_name || 'Unknown Company'} (Relevance: ${Math.round(m.similarity * 100)}%)`).join('\n')}

Write a very brief (1-2 sentences) natural conversational response introducing these contacts. Be friendly. No markdown formatting.
          `;
          
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const streamResult = await ai.models.generateContentStream({
            model: "gemini-flash-lite-latest",
            contents: prompt,
          });
          
          for await (const chunk of streamResult) {
            if (chunk.text) {
              await writer.write(encoder.encode(JSON.stringify({ type: 'text', chunk: chunk.text }) + "\n"));
            }
          }
        }
      } catch (err) {
        console.error("[Search Stream] Error:", err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      }
    });
  } catch (err) {
    console.error("[Search API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
