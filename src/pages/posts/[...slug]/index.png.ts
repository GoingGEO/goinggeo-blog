import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import sharp from "sharp";
import { getPostSlug } from "@/utils/getPostPaths";
import config from "@/config";

function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "\u2026";
}

function buildPostOGSvg(title: string, author: string, siteTitle: string): string {
  const displayTitle = truncate(title, 48);
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fafafa"/>
  <rect x="48" y="48" width="1104" height="534" rx="16" fill="#ffffff" stroke="#e2e2e2" stroke-width="2"/>
  <rect x="48" y="48" width="8" height="534" rx="4" fill="#2563eb"/>
  <text x="100" y="200" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="#9ca3af">Article</text>
  <text x="100" y="310" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" fill="#1c1c1e">${escapeXml(displayTitle)}</text>
  <text x="100" y="500" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" fill="#6b7280">by ${escapeXml(author)}</text>
  <text x="100" y="540" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" fill="#2563eb">${escapeXml(siteTitle)}</text>
</svg>`;
}

export async function getStaticPaths() {
  if (!config.features.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("posts").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  const svg = buildPostOGSvg(
    props.data.title ?? config.site.title,
    props.data.author ?? "",
    config.site.title
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
