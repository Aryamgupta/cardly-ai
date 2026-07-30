import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import sharp from "sharp";
import { toAppError } from "@/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const { cardId } = await request.json();

    if (!cardId) {
      return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch the card and its ai_metadata
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (fetchError || !card) {
      throw new Error(`Card not found: ${fetchError?.message}`);
    }

    // Always use the original uncropped image path for testing
    const originalPath = card.original_image_path.replace(/cropped(_\d+)?/, 'original');

    // 1. Download the original image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("business-cards")
      .download(originalPath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download original image: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const extractedData = card.ai_metadata;

    // 2. OpenCV Perspective Transform
    if (!extractedData.card_corners) {
      // Fallback for old AI metadata
      throw new Error("No card_corners found in ai_metadata. Please test AI prompt first.");
    }
    const corners = extractedData.card_corners;

    // Force EXIF rotation and get raw pixel data (RGBA)
    const { data: rawData, info } = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Pure JS Perspective Transform (Replaces opencv-js to avoid Next.js WASM hanging issues)
    const w = info.width;
    const h = info.height;

    // De-normalize coordinates
    const tl = { x: (corners.top_left.x / 1000) * w, y: (corners.top_left.y / 1000) * h };
    const tr = { x: (corners.top_right.x / 1000) * w, y: (corners.top_right.y / 1000) * h };
    const br = { x: (corners.bottom_right.x / 1000) * w, y: (corners.bottom_right.y / 1000) * h };
    const bl = { x: (corners.bottom_left.x / 1000) * w, y: (corners.bottom_left.y / 1000) * h };

    // Calculate max width and height for the new flat image
    const widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
    const widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
    const maxWidth = Math.max(Math.round(widthA), Math.round(widthB));

    const heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
    const heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));
    const maxHeight = Math.max(Math.round(heightA), Math.round(heightB));

    const srcPoints = [tl, tr, br, bl];
    const dstPoints = [
      { x: 0, y: 0 },
      { x: maxWidth - 1, y: 0 },
      { x: maxWidth - 1, y: maxHeight - 1 },
      { x: 0, y: maxHeight - 1 }
    ];

    // Math: Get Perspective Transform Matrix (8x8 system solver)
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

    // Math: Invert 3x3 Matrix for backwards mapping (destination -> source)
    const det = M[0]*(M[4]*M[8] - M[5]*M[7]) - M[1]*(M[3]*M[8] - M[5]*M[6]) + M[2]*(M[3]*M[7] - M[4]*M[6]);
    const Minv = [
        (M[4]*M[8] - M[5]*M[7])/det, (M[2]*M[7] - M[1]*M[8])/det, (M[1]*M[5] - M[2]*M[4])/det,
        (M[5]*M[6] - M[3]*M[8])/det, (M[0]*M[8] - M[2]*M[6])/det, (M[2]*M[3] - M[0]*M[5])/det,
        (M[3]*M[7] - M[4]*M[6])/det, (M[1]*M[6] - M[0]*M[7])/det, (M[0]*M[4] - M[1]*M[3])/det
    ];

    // Math: Bilinear interpolation warp
    const dstData = new Uint8Array(maxWidth * maxHeight * 4);
    for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < maxWidth; x++) {
            const z = Minv[6]*x + Minv[7]*y + Minv[8];
            const sx = (Minv[0]*x + Minv[1]*y + Minv[2]) / z;
            const sy = (Minv[3]*x + Minv[4]*y + Minv[5]) / z;
            
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

    // Convert back to JPEG buffer via Sharp
    const croppedBuffer = await sharp(Buffer.from(dstData), {
      raw: {
        width: maxWidth,
        height: maxHeight,
        channels: 4
      }
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const timestamp = Date.now();
    const croppedPath = originalPath.replace('original', `cropped_${timestamp}`);

    const { error: uploadError } = await supabase.storage
      .from("business-cards")
      .upload(croppedPath, croppedBuffer, { contentType: "image/jpeg" });

    if (uploadError) {
      throw new Error(`Failed to upload cropped image: ${uploadError.message}`);
    }

    // Update DB to point to cropped (if not already)
    await supabase
      .from("cards")
      .update({ original_image_path: croppedPath })
      .eq("id", cardId);

    return NextResponse.json({ success: true, message: "Cropped and rotated successfully without hitting AI" });

  } catch (error) {
    const appErr = toAppError(error);
    console.error("Test Crop Error:", appErr);
    return NextResponse.json(
      { error: appErr.message },
      { status: appErr.statusCode || 500 }
    );
  }
}
