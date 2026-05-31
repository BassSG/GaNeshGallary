import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

const outDir = "public/icons";
const CRC_TABLE = makeCrcTable();

await mkdir(outDir, { recursive: true });
const icon192 = createIconPng(192);
const icon512 = createIconPng(512);
await writeFile(`${outDir}/icon-192.png`, icon192);
await writeFile(`${outDir}/icon-512.png`, icon512);
await writeFile(`${outDir}/gallery-icon-192.png`, icon192);
await writeFile(`${outDir}/gallery-icon-512.png`, icon512);
await writeFile(`${outDir}/icon-maskable-192.png`, icon192);
await writeFile(`${outDir}/icon-maskable-512.png`, icon512);
await writeFile(`${outDir}/gallery-icon-maskable-192.png`, icon192);
await writeFile(`${outDir}/gallery-icon-maskable-512.png`, icon512);

console.log("Generated PWA PNG icons.");

function createIconPng(size) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 4;
      const t = (x + y) / (width + height);
      const bg = mix([27, 29, 26], [15, 17, 16], t);
      setPixel(raw, offset, bg[0], bg[1], bg[2], 255);
    }
  }

  drawRoundedRect(raw, width, height, size * 0.1, size * 0.1, size * 0.8, size * 0.8, size * 0.16, [217, 164, 60, 255]);
  drawRoundedRect(raw, width, height, size * 0.125, size * 0.125, size * 0.75, size * 0.75, size * 0.14, [13, 18, 22, 255]);
  drawRoundedLine(raw, width, height, width * 0.18, height * 0.81, width * 0.82, height * 0.81, size * 0.016, [67, 214, 190, 255]);

  drawPhotoCard(raw, width, height, size * 0.21, size * 0.27, size * 0.27, size * 0.43, [20, 131, 148, 255], [9, 47, 58, 255]);
  drawPhotoCard(raw, width, height, size * 0.52, size * 0.25, size * 0.27, size * 0.44, [105, 80, 40, 255], [31, 42, 37, 255]);
  drawPhotoCard(raw, width, height, size * 0.34, size * 0.18, size * 0.32, size * 0.53, [224, 176, 86, 255], [24, 52, 62, 255]);

  drawCircle(raw, width, height, width * 0.72, height * 0.69, size * 0.13, [20, 19, 16, 255]);
  drawCircle(raw, width, height, width * 0.72, height * 0.69, size * 0.105, [218, 166, 60, 255]);
  drawCircle(raw, width, height, width * 0.72, height * 0.69, size * 0.085, [18, 18, 16, 255]);
  drawCircle(raw, width, height, width * 0.765, height * 0.64, size * 0.018, [255, 226, 148, 255]);
  drawMountainBadge(raw, width, height, size);

  return pngEncode(width, height, raw);
}

function drawPhotoCard(buffer, width, height, x, y, cardWidth, cardHeight, topColor, bottomColor) {
  const radius = width * 0.04;
  drawRoundedRect(buffer, width, height, x - width * 0.012, y + height * 0.018, cardWidth, cardHeight, radius, [0, 0, 0, 255]);
  drawRoundedRect(buffer, width, height, x, y, cardWidth, cardHeight, radius, [245, 241, 231, 255]);
  drawRoundedRect(buffer, width, height, x + width * 0.018, y + height * 0.018, cardWidth - width * 0.036, cardHeight - height * 0.036, radius * 0.72, topColor);
  drawRoundedRect(buffer, width, height, x + width * 0.018, y + cardHeight * 0.56, cardWidth - width * 0.036, cardHeight * 0.42, radius * 0.45, bottomColor);
  drawRoundedLine(buffer, width, height, x + cardWidth * 0.18, y + cardHeight * 0.72, x + cardWidth * 0.46, y + cardHeight * 0.52, width * 0.012, [248, 214, 138, 245]);
  drawRoundedLine(buffer, width, height, x + cardWidth * 0.42, y + cardHeight * 0.52, x + cardWidth * 0.82, y + cardHeight * 0.75, width * 0.012, [248, 214, 138, 245]);
}

function drawMountainBadge(buffer, width, height, size) {
  drawRoundedLine(buffer, width, height, width * 0.66, height * 0.73, width * 0.71, height * 0.66, size * 0.018, [255, 218, 126, 255]);
  drawRoundedLine(buffer, width, height, width * 0.71, height * 0.66, width * 0.76, height * 0.73, size * 0.018, [255, 218, 126, 255]);
  drawRoundedLine(buffer, width, height, width * 0.74, height * 0.73, width * 0.79, height * 0.68, size * 0.018, [255, 218, 126, 255]);
  drawRoundedLine(buffer, width, height, width * 0.79, height * 0.68, width * 0.84, height * 0.73, size * 0.018, [255, 218, 126, 255]);
}

function setPixel(buffer, offset, r, g, b, a) {
  buffer[offset] = r;
  buffer[offset + 1] = g;
  buffer[offset + 2] = b;
  buffer[offset + 3] = a;
}

function mix(a, b, t) {
  return a.map((value, index) => Math.round(value + (b[index] - value) * t));
}

function drawCircle(buffer, width, height, cx, cy, radius, rgba) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius));
  const r2 = radius * radius;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        setPixel(buffer, offset, rgba[0], rgba[1], rgba[2], rgba[3]);
      }
    }
  }
}

function drawRoundedRect(buffer, width, height, x, y, rectWidth, rectHeight, radius, rgba) {
  const minX = Math.max(0, Math.floor(x));
  const maxX = Math.min(width - 1, Math.ceil(x + rectWidth));
  const minY = Math.max(0, Math.floor(y));
  const maxY = Math.min(height - 1, Math.ceil(y + rectHeight));

  for (let yy = minY; yy <= maxY; yy += 1) {
    for (let xx = minX; xx <= maxX; xx += 1) {
      const dx = Math.max(x + radius - xx, 0, xx - (x + rectWidth - radius));
      const dy = Math.max(y + radius - yy, 0, yy - (y + rectHeight - radius));
      if (dx * dx + dy * dy <= radius * radius) {
        const offset = yy * (width * 4 + 1) + 1 + xx * 4;
        setPixel(buffer, offset, rgba[0], rgba[1], rgba[2], rgba[3]);
      }
    }
  }
}

function drawArc(buffer, width, height, cx, cy, radius, thickness, rgba) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      const angle = Math.atan2(y - cy, x - cx);
      const distance = Math.hypot(x - cx, y - cy);
      if (angle > 0.2 && angle < 2.95 && Math.abs(distance - radius) < thickness) {
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        setPixel(buffer, offset, rgba[0], rgba[1], rgba[2], rgba[3]);
      }
    }
  }
}

function drawRoundedLine(buffer, width, height, x1, y1, x2, y2, radius, rgba) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - radius));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(x1, x2) + radius));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - radius));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(y1, y2) + radius));
  const length = Math.hypot(x2 - x1, y2 - y1);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (length * length)));
      const px = x1 + t * (x2 - x1);
      const py = y1 + t * (y2 - y1);
      if (Math.hypot(x - px, y - py) <= radius) {
        const offset = y * (width * 4 + 1) + 1 + x * 4;
        setPixel(buffer, offset, rgba[0], rgba[1], rgba[2], rgba[3]);
      }
    }
  }
}

function pngEncode(width, height, raw) {
  const chunks = [
    chunk("IHDR", Buffer.concat([u32(width), u32(height), Buffer.from([8, 6, 0, 0, 0])])),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ];
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([u32(data.length), typeBuffer, data, u32(crc32(Buffer.concat([typeBuffer, data])))]);
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
  });
}
