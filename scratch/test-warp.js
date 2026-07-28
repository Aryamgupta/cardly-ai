const sharp = require('sharp');
function getPerspectiveTransform(src, dst) {
    const A = [];
    const B = [];
    for (let i = 0; i < 4; i++) {
        A.push([src[i].x, src[i].y, 1, 0, 0, 0, -src[i].x * dst[i].x, -src[i].y * dst[i].x]);
        B.push(dst[i].x);
        A.push([0, 0, 0, src[i].x, src[i].y, 1, -src[i].x * dst[i].y, -src[i].y * dst[i].y]);
        B.push(dst[i].y);
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) maxRow = j;
        }
        const tempA = A[i]; A[i] = A[maxRow]; A[maxRow] = tempA;
        const tempB = B[i]; B[i] = B[maxRow]; B[maxRow] = tempB;
        for (let j = i + 1; j < n; j++) {
            const c = -A[j][i] / A[i][i];
            for (let k = i; k < n; k++) {
                if (i === k) A[j][k] = 0; else A[j][k] += c * A[i][k];
            }
            B[j] += c * B[i];
        }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = B[i] / A[i][i];
        for (let j = i - 1; j >= 0; j--) B[j] -= A[j][i] * x[i];
    }
    x.push(1);
    return x;
}
function invert3x3(m) {
    const det = m[0]*(m[4]*m[8] - m[5]*m[7]) - m[1]*(m[3]*m[8] - m[5]*m[6]) + m[2]*(m[3]*m[7] - m[4]*m[6]);
    return [
        (m[4]*m[8] - m[5]*m[7])/det, (m[2]*m[7] - m[1]*m[8])/det, (m[1]*m[5] - m[2]*m[4])/det,
        (m[5]*m[6] - m[3]*m[8])/det, (m[0]*m[8] - m[2]*m[6])/det, (m[2]*m[3] - m[0]*m[5])/det,
        (m[3]*m[7] - m[4]*m[6])/det, (m[1]*m[6] - m[0]*m[7])/det, (m[0]*m[4] - m[1]*m[3])/det
    ];
}
function warpImage(srcData, srcW, srcH, dstW, dstH, Minv) {
    const dstData = new Uint8Array(dstW * dstH * 4);
    for (let y = 0; y < dstH; y++) {
        for (let x = 0; x < dstW; x++) {
            const z = Minv[6]*x + Minv[7]*y + Minv[8];
            const sx = (Minv[0]*x + Minv[1]*y + Minv[2]) / z;
            const sy = (Minv[3]*x + Minv[4]*y + Minv[5]) / z;
            
            const x1 = Math.floor(sx); const y1 = Math.floor(sy);
            const x2 = x1 + 1; const y2 = y1 + 1;
            
            if (x1 >= 0 && x2 < srcW && y1 >= 0 && y2 < srcH) {
                const wx = sx - x1; const wy = sy - y1;
                const idx1 = (y1 * srcW + x1) * 4; const idx2 = (y1 * srcW + x2) * 4;
                const idx3 = (y2 * srcW + x1) * 4; const idx4 = (y2 * srcW + x2) * 4;
                for (let c = 0; c < 4; c++) {
                    const top = srcData[idx1 + c] * (1 - wx) + srcData[idx2 + c] * wx;
                    const bot = srcData[idx3 + c] * (1 - wx) + srcData[idx4 + c] * wx;
                    dstData[(y * dstW + x) * 4 + c] = top * (1 - wy) + bot * wy;
                }
            }
        }
    }
    return dstData;
}
console.log("Compiles successfully.");
