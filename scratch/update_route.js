const fs = require('fs');

const routePath = 'src/app/api/extract-card/route.ts';
let content = fs.readFileSync(routePath, 'utf8');

// 1. Add cropImage function
const cropImageFunc = `
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
    const croppedPath = imagePath.replace(/cropped(_\\d+)?/, 'original').replace('original', \`cropped_\${timestamp}\`);

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
`;

content = content + "\\n" + cropImageFunc;

// 2. Replace the prompt corners schema
content = content.replace(
  /"card_corners": {\\s*"top_left": { "x": number, "y": number },\\s*"top_right": { "x": number, "y": number },\\s*"bottom_right": { "x": number, "y": number },\\s*"bottom_left": { "x": number, "y": number }\\s*}/,
  \`"front_card_corners": {
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
        }\`
);

content = content.replace(
  "For 'card_corners', detect the four visible corners of the physical business card.",
  "For 'front_card_corners' and 'back_card_corners', detect the four visible corners of the physical business card in the respective images (front image is first, back image is second if provided). If no back image is provided, set back_card_corners to null."
);

// 3. Keep track of backArrayBuffer
content = content.replace(
  "let base64BackImage = null;",
  "let backArrayBuffer = null;\\n    let base64BackImage = null;"
);
content = content.replace(
  "const arr = await backData.arrayBuffer();",
  "backArrayBuffer = await backData.arrayBuffer();"
);
content = content.replace(
  "base64BackImage = Buffer.from(arr).toString(\\"base64\\");",
  "base64BackImage = Buffer.from(backArrayBuffer).toString(\\"base64\\");"
);

// 4. Replace the old cropping logic with new calls
const oldCroppingLogicStart = "    // 3.5. OpenCV Perspective Transform";
const oldCroppingLogicEnd = "    // 3.5 Duplicate Detection";

const startIdx = content.indexOf(oldCroppingLogicStart);
const endIdx = content.indexOf(oldCroppingLogicEnd);

const newCroppingLogic = \`
    let finalImagePath = imagePath;
    let finalBackImagePath = backImagePath;

    if (extractedData.front_card_corners) {
       finalImagePath = await cropImage(arrayBuffer, extractedData.front_card_corners, imagePath, supabase) || imagePath;
    }
    
    if (backImagePath && backArrayBuffer && extractedData.back_card_corners) {
       finalBackImagePath = await cropImage(backArrayBuffer, extractedData.back_card_corners, backImagePath, supabase) || backImagePath;
    }

\`;

content = content.substring(0, startIdx) + newCroppingLogic + content.substring(endIdx);

// 5. Update the DB call
content = content.replace("back_image_path: backImagePath,", "back_image_path: finalBackImagePath,");

fs.writeFileSync(routePath, content);
console.log("Updated route.ts");
