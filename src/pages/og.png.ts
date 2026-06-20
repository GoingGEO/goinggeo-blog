import type { APIRoute } from "astro";
import sharp from "sharp";
import config from "@/config";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOGSvg(title: string, subtitle: string, hostname: string): string {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fafafa"/>
  <rect x="48" y="48" width="1104" height="534" rx="16" fill="#ffffff" stroke="#e2e2e2" stroke-width="2"/>
  <rect x="48" y="48" width="8" height="534" rx="4" fill="#2563eb"/>
  <text x="100" y="280" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="72" font-weight="700" fill="#1c1c1e">${escapeXml(title)}</text>
  <text x="100" y="340" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="28" fill="#6b7280">${escapeXml(subtitle)}</text>
  <text x="100" y="530" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" fill="#2563eb">${escapeXml(hostname)}</text>
</svg>`;
}

export const GET: APIRoute = async () => {
  const svg = buildOGSvg(
    config.site.title,
    config.site.description,
    new URL(config.site.url).hostname
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
