import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import { getPostSlug } from "@/utils/getPostPaths";
import config from "@/config";

const FONT_FAMILY = "Google Sans Code";

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

export const GET: APIRoute = async ({ props, url }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  // Attempt to load fonts via the Astro fonts API.
  const astroFonts = fontData["--font-google-sans-code"];
  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] | null = null;

  if (astroFonts && astroFonts.length > 0) {
    const regularFontPath = getFontPathByWeight(astroFonts, 400);
    const boldFontPath = getFontPathByWeight(astroFonts, 700);
    if (regularFontPath && boldFontPath) {
      try {
        const [regularData, boldData] = await Promise.all([
          fetch(experimental_getFontFileURL(regularFontPath, url)).then(res =>
            res.arrayBuffer()
          ),
          fetch(experimental_getFontFileURL(boldFontPath, url)).then(res =>
            res.arrayBuffer()
          ),
        ]);
        fonts = [
          { name: FONT_FAMILY, data: regularData, weight: 400 as const, style: "normal" as const },
          { name: FONT_FAMILY, data: boldData, weight: 700 as const, style: "normal" as const },
        ];
      } catch {
        fonts = null;
      }
    }
  }

  // Fallback: generate a simple OG image without satori.
  if (!fonts) {
    const title = String(props.data.title ?? config.site.title);
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#fafafa"/>
      <rect x="40" y="40" width="1120" height="550" rx="8" fill="#ffffff" stroke="#e5e5ea" stroke-width="2"/>
      <text x="80" y="300" font-family="sans-serif" font-size="56" font-weight="bold" fill="#1c1c1e">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
      <text x="80" y="540" font-family="sans-serif" font-size="24" font-weight="bold" fill="#2563eb">${config.site.title}</text>
    </svg>`;
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return new Response(new Uint8Array(pngBuffer), {
      headers: { "Content-Type": "image/png" },
    });
  }

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          background: "#fefbfb",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-1px",
                right: "-1px",
                border: "4px solid #000",
                background: "#ecebeb",
                opacity: "0.9",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                margin: "2.5rem",
                width: "88%",
                height: "80%",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                border: "4px solid #000",
                background: "#fefbfb",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                margin: "2rem",
                width: "88%",
                height: "80%",
              },
              children: {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    margin: "20px",
                    width: "90%",
                    height: "90%",
                  },
                  children: [
                    {
                      type: "p",
                      props: {
                        style: {
                          fontSize: 72,
                          fontWeight: "bold",
                          maxHeight: "84%",
                          overflow: "hidden",
                        },
                        children: props.data.title,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          marginBottom: "8px",
                          fontSize: 28,
                        },
                        children: [
                          {
                            type: "span",
                            props: {
                              children: [
                                "by ",
                                {
                                  type: "span",
                                  props: {
                                    style: { color: "transparent" },
                                    children: '"',
                                  },
                                },
                                {
                                  type: "span",
                                  props: {
                                    style: {
                                      overflow: "hidden",
                                      fontWeight: "bold",
                                    },
                                    children: props.data.author,
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: "span",
                            props: {
                              style: { overflow: "hidden", fontWeight: "bold" },
                              children: config.site.title,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts,
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
