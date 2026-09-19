/**
 * Renders the Open Graph preview image used by LinkedIn, WhatsApp and search
 * engines. Regenerate with `npm run export:og` when the headline changes.
 */
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2a28"/>
      <stop offset="100%" stop-color="#0b0f12"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#1b2429" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join("")}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 105}" x2="1200" y2="${i * 105}"/>`).join("")}
  </g>
  <rect x="80" y="196" width="56" height="3" fill="#3ddbc4"/>
  <text x="80" y="176" fill="#3ddbc4" font-family="monospace" font-size="24" letter-spacing="6">CURRICULUM VITAE</text>
  <text x="80" y="300" fill="#e8edf2" font-family="Helvetica, Arial, sans-serif" font-size="86" font-weight="bold" letter-spacing="-3">Roney de Oliveira</text>
  <text x="80" y="360" fill="#a9b6c2" font-family="Helvetica, Arial, sans-serif" font-size="38">Software Engineer</text>
  <text x="80" y="424" fill="#74838f" font-family="monospace" font-size="25">Backend · Full Stack · DevOps</text>
  <text x="80" y="466" fill="#74838f" font-family="monospace" font-size="25">Go · Node.js · React · Kubernetes</text>
  <text x="80" y="556" fill="#3ddbc4" font-family="monospace" font-size="25">roneyrogerio.dev</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(join(root, "public", "og.png"), png);
console.log("OG gerada: public/og.png");
