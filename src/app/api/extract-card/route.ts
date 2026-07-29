import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const { cardId, imagePath, backImagePath } = await request.json();


    if (!cardId || !imagePath) {
      return NextResponse.json(
        { error: "Missing cardId or imagePath" },
        { status: 400 },
      );
    }

    // 1. Download the image using Supabase Storage
    const supabase = await createClient();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("business-cards")
      .download(imagePath);

    if (downloadError || !fileData) {
      throw new Error(
        `Failed to download image from storage: ${downloadError?.message}`,
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = fileData.type || "image/jpeg";

    let backArrayBuffer = null;
    let base64BackImage = null;
    let mimeTypeBack = null;
    if (backImagePath) {
      const { data: backData } = await supabase.storage.from("business-cards").download(backImagePath);
      if (backData) {
        backArrayBuffer = await backData.arrayBuffer();
        base64BackImage = Buffer.from(backArrayBuffer).toString("base64");
        mimeTypeBack = backData.type || "image/jpeg";
      }
    }

    // 2. Setup Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Call Gemini
    const prompt = `
      You are an expert AI business card data extractor and translator.
      You are provided with one or two images of a business card (front and potentially back).
      You MUST analyze ALL provided images (both front and back sides) and combine all relevant information across both. Do not ignore the second image if it exists.
      IMPORTANT: You must translate ALL extracted text (job title, company name, address, tags, summary, etc.) into English, irrespective of the original language on the business card. Names (full_name) should be kept in their original format but transliterated to the Latin alphabet if necessary.
      If a person's full name is NOT written on the card (e.g. it's just a general company card), you MUST use the company/firm name as the 'full_name'.
      Return the data strictly as a JSON object matching the following structure exactly (use null if a field is not found):
      {
        "full_name": "String",
        "job_title": "String",
        "company_name": "String",
        "email": "String",
        "phone": "String",
        "has_whatsapp": "Boolean",
        "website": "String",
        "address": "String",
        "geolocation": { "lat": number, "lng": number },
        "social_profiles": ["String", "String"],
        "tags": ["String", "String"],
        "summary": "String",
        "qr_url": "String",
        "front_card_corners": {
          "top_left": { "x": number, "y": number },
          "top_right": { "x": number, "y": number },
          "bottom_right": { "x": number, "y": number },
          "bottom_left": { "x": number, "y": number }
        },
        "back_card_corners": {
          "top_left": { "x": number, "y": number },
          "top_right": { "x": number, "y": number },
          "bottom_right": { "x": number, "y": number },
          "bottom_left": { "x": number, "y": number }
        }
      }
     
      For 'front_card_corners' and 'back_card_corners', detect the four visible corners of the physical business card in the respective images (front image is first, back image is second if provided). If no back image is provided, set back_card_corners to null.
      Coordinates must be normalized from 0-1000.
      Return ONLY the physical card edges.
      Do not include shadows, background, or table surface.
      The four points must lie exactly on the card corners, forming the exact quadrilateral of the card.
      
      For 'geolocation', use your intuition and world knowledge to generate approximate latitude and longitude coordinates based on the extracted address (e.g. if the address is just a city or incomplete, provide the lat/lng for that general area). Return null if no location can be determined.

      For 'has_whatsapp', look closely at the phone number on the card. If there is a WhatsApp logo, icon, or explicit mention of WhatsApp next to it, return true. Otherwise, return false.

      For 'tags', generate 2-3 highly relevant, short categorical tags (max 2 words each) describing the person's industry, sector, or professional domain (e.g., "Enterprise AI", "Fintech", "Real Estate").

      For 'summary', generate a short professional summary of the person and company based on the card. IMPORTANT: You must also explicitly extract and append any handwritten notes, scribbles, or extra text written on the card into this 'summary' field.

      For 'qr_url', carefully scan BOTH images (front and back) for any QR codes. If you detect a QR code on either side, visually decode it and return the exact URL or text it represents. If no QR code is found, return null.

      Do not include any markdown formatting, backticks, or extra text. Return ONLY the JSON object.
    `;

    const modelsToTry = ["gemini-flash-latest", "gemini-pro-latest"];
    let result;
    let textResult;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                  },
                },
                ...(base64BackImage ? [{
                  inlineData: {
                    data: base64BackImage,
                    mimeType: mimeTypeBack!,
                  }
                }] : [])
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        textResult = result.text;
        if (textResult) {
          break; // Exit loop on success
        }
      } catch (err: any) {
        console.error(`Model ${modelName} failed:`, err.message || err);
        lastError = err;
        // Proceed to next model in the array
      }
    }

    if (!textResult) {
      throw new Error(`All AI models failed due to high demand or errors. Last error: ${lastError?.message || "No text returned"}`);
    }

    // Strip markdown formatting if Gemini includes it (e.g., ```json\n...\n```)
    textResult = textResult.replace(/```(?:json)?/g, '').trim();

    let extractedData;
    try {
      extractedData = JSON.parse(textResult);
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON", textResult);
      throw new Error("Invalid JSON returned by AI");
    }

    let finalImagePath = imagePath;
    let finalBackImagePath = backImagePath;

    if (extractedData.front_card_corners) {
       finalImagePath = await cropImage(arrayBuffer, extractedData.front_card_corners, imagePath, supabase) || imagePath;
    }
    
    if (backImagePath && backArrayBuffer && extractedData.back_card_corners) {
       finalBackImagePath = await cropImage(backArrayBuffer, extractedData.back_card_corners, backImagePath, supabase) || backImagePath;
    }

    // 3.5 Duplicate Detection
    const { data: { user } } = await supabase.auth.getUser();
    if (user && extractedData.email) {
      const { data: duplicates } = await supabase
        .from("cards")
        .select("id")
        .eq("user_id", user.id)
        .neq("id", cardId)
        .contains("emails", [extractedData.email])
        .limit(1);
      
      if (duplicates && duplicates.length > 0) {
        await supabase.from("cards").delete().eq("id", cardId);
        return NextResponse.json(
          { error: "Duplicate contact detected. You already have a card for this email address." },
          { status: 409 }
        );
      }
    } else if (user && extractedData.full_name) {
      const { data: duplicates } = await supabase
        .from("cards")
        .select("id")
        .eq("user_id", user.id)
        .neq("id", cardId)
        .ilike("full_name", extractedData.full_name)
        .limit(1);

      if (duplicates && duplicates.length > 0) {
        await supabase.from("cards").delete().eq("id", cardId);
        return NextResponse.json(
          { error: "Duplicate contact detected. You already have a card for this person." },
          { status: 409 }
        );
      }
    }

    // 4. Update Database
    const { error: updateError } = await supabase
      .from("cards")
      .update({
        full_name: extractedData.full_name,
        designation: extractedData.job_title,
        company_name: extractedData.company_name,
        emails: extractedData.email ? [extractedData.email] : [],
        phones: extractedData.phone ? [extractedData.phone] : [],
        website: extractedData.website,
        address: extractedData.address ? { text: extractedData.address, coordinates: extractedData.geolocation } : {},
        social_links: extractedData.social_profiles
          ? { links: extractedData.social_profiles }
          : {},
        notes: extractedData.summary,
        ai_metadata: extractedData,
        processing_status: "ready_for_review",
        original_image_path: finalImagePath,
        back_image_path: finalBackImagePath,
      })
      .eq("id", cardId);

    if (updateError) {
      console.error("Failed to update database", updateError);
      throw new Error("Database update failed");
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error occurred" },
      { status: 500 },
    );
  }
}


async function cropImage(arrayBuffer: ArrayBuffer, corners: any, imagePath: string, supabase: any): Promise<string | null> {
  try {
    const { data: rawData, info } = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;

    const tl = { x: (corners.top_left.x / 1000) * w, y: (corners.top_left.y / 1000) * h };
    const tr = { x: (corners.top_right.x / 1000) * w, y: (corners.top_right.y / 1000) * h };
    const br = { x: (corners.bottom_right.x / 1000) * w, y: (corners.bottom_right.y / 1000) * h };
    const bl = { x: (corners.bottom_left.x / 1000) * w, y: (corners.bottom_left.y / 1000) * h };

    const widthA = Math.sqrt(pow(br.x - bl.x, 2) + pow(br.y - bl.y, 2));
    const widthB = Math.sqrt(pow(tr.x - tl.x, 2) + pow(tr.y - tl.y, 2));
    const maxWidth = Math.max(Math.round(widthA), Math.round(widthB));

    const heightA = Math.sqrt(pow(tr.x - br.x, 2) + pow(tr.y - br.y, 2));
    const heightB = Math.sqrt(pow(tl.x - bl.x, 2) + pow(tl.y - bl.y, 2));
    const maxHeight = Math.max(Math.round(heightA), Math.round(heightB));

    const srcPoints = [tl, tr, br, bl];
    const dstPoints = [
      { x: 0, y: 0 },
      { x: maxWidth - 1, y: 0 },
      { x: maxWidth - 1, y: maxHeight - 1 },
      { x: 0, y: maxHeight - 1 }
    ];

    const A = [];
    const B = [];
    for (let i = 0; i < 4; i++) {
      A.push([srcPoints[i].x, srcPoints[i].y, 1, 0, 0, 0, -srcPoints[i].x * dstPoints[i].x, -srcPoints[i].y * dstPoints[i].x]);
      B.push(dstPoints[i].x);
      A.push([0, 0, 0, srcPoints[i].x, srcPoints[i].y, 1, -srcPoints[i].x * dstPoints[i].y, -srcPoints[i].y * dstPoints[i].y]);
      B.push(dstPoints[i].y);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) maxRow = j;
      const tempA: number[] = A[i]; A[i] = A[maxRow]; A[maxRow] = tempA;
      const tempB: number = B[i]; B[i] = B[maxRow]; B[maxRow] = tempB;
      for (let j = i + 1; j < n; j++) {
        const c = -A[j][i] / A[i][i];
        for (let k = i; k < n; k++) if (i === k) A[j][k] = 0; else A[j][k] += c * A[i][k];
        B[j] += c * B[i];
      }
    }
    const M = new Array(9);
    for (let i = n - 1; i >= 0; i--) {
      M[i] = B[i] / A[i][i];
      for (let j = i - 1; j >= 0; j--) B[j] -= A[j][i] * M[i];
    }
    M[8] = 1;

    const det = M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6]);
    const Minv = [
      (M[4] * M[8] - M[5] * M[7]) / det, (M[2] * M[7] - M[1] * M[8]) / det, (M[1] * M[5] - M[2] * M[4]) / det,
      (M[5] * M[6] - M[3] * M[8]) / det, (M[0] * M[8] - M[2] * M[6]) / det, (M[2] * M[3] - M[0] * M[5]) / det,
      (M[3] * M[7] - M[4] * M[6]) / det, (M[1] * M[6] - M[0] * M[7]) / det, (M[0] * M[4] - M[1] * M[3]) / det
    ];

    const dstData = new Uint8Array(maxWidth * maxHeight * 4);
    for (let y = 0; y < maxHeight; y++) {
      for (let x = 0; x < maxWidth; x++) {
        const z = Minv[6] * x + Minv[7] * y + Minv[8];
        const sx = (Minv[0] * x + Minv[1] * y + Minv[2]) / z;
        const sy = (Minv[3] * x + Minv[4] * y + Minv[5]) / z;
        const x1 = Math.floor(sx); const y1 = Math.floor(sy);
        const x2 = x1 + 1; const y2 = y1 + 1;
        if (x1 >= 0 && x2 < w && y1 >= 0 && y2 < h) {
          const wx = sx - x1; const wy = sy - y1;
          const idx1 = (y1 * w + x1) * 4; const idx2 = (y1 * w + x2) * 4;
          const idx3 = (y2 * w + x1) * 4; const idx4 = (y2 * w + x2) * 4;
          for (let c = 0; c < 4; c++) {
            const top = rawData[idx1 + c] * (1 - wx) + rawData[idx2 + c] * wx;
            const bot = rawData[idx3 + c] * (1 - wx) + rawData[idx4 + c] * wx;
            dstData[(y * maxWidth + x) * 4 + c] = top * (1 - wy) + bot * wy;
          }
        }
      }
    }

    const croppedBuffer = await sharp(Buffer.from(dstData), {
      raw: { width: maxWidth, height: maxHeight, channels: 4 }
    }).jpeg({ quality: 90 }).toBuffer();

    const timestamp = Date.now();
    const croppedPath = imagePath.replace(/cropped(_\d+)?/, 'original').replace('original', `cropped_${timestamp}`);

    const { error: uploadError } = await supabase.storage.from("business-cards").upload(croppedPath, croppedBuffer, { contentType: "image/jpeg" });
    
    if (uploadError) {
      console.error("Failed to upload cropped image", uploadError);
      return null;
    }
    return croppedPath;
  } catch (err) {
    console.error("Error cropping image:", err);
    return null;
  }
}

function pow(base: number, exp: number) {
  return Math.pow(base, exp);
}
