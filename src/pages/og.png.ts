import type { APIRoute } from "astro";
import satori from "satori";
import sharp from "sharp";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import config from "@/config";

const FONT_FAMILY = "Google Sans Code";

/** Attempt to load font data via the Astro fonts API (requires network access to Google Fonts). */
async function loadFonts(context: { url: URL }) {
  const astroFonts = fontData["--font-google-sans-code"];
  if (!astroFonts || astroFonts.length === 0) return null;

  const regularFontPath = getFontPathByWeight(astroFonts, 400);
  const boldFontPath = getFontPathByWeight(astroFonts, 700);
  if (!regularFontPath || !boldFontPath) return null;

  try {
    const [regularData, boldData] = await Promise.all([
      fetch(experimental_getFontFileURL(regularFontPath, context.url)).then(res =>
        res.arrayBuffer()
      ),
      fetch(experimental_getFontFileURL(boldFontPath, context.url)).then(res =>
        res.arrayBuffer()
      ),
    ]);
    return [
      { name: FONT_FAMILY, data: regularData, weight: 400 as const, style: "normal" as const },
      { name: FONT_FAMILY, data: boldData, weight: 700 as const, style: "normal" as const },
    ];
  } catch {
    return null;
  }
}

/** Generate a simple fallback OG image using SVG + sharp (no external font dependency). */
function fallbackOGImage(): Buffer {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#fafafa"/>
    <rect x="40" y="40" width="1120" height="550" rx="8" fill="#ffffff" stroke="#e5e5ea" stroke-width="2"/>
    <text x="600" y="280" font-family="sans-serif" font-size="64" font-weight="bold" text-anchor="middle" fill="#1c1c1e">${config.site.title}</text>
    <text x="600" y="340" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#6b7280">${config.site.description}</text>
    <text x="600" y="540" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#2563eb">${new URL(config.site.url).hostname}</text>
  </svg>`;
  return Buffer.from(svg);
}

export const GET: APIRoute = async context => {
  const fonts = await loadFonts(context);

  // If fonts aren't available (e.g. offline build), use the SVG fallback.
  if (!fonts) {
    const pngBuffer = await sharp(fallbackOGImage()).png().toBuffer();
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
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "90%",
                          maxHeight: "90%",
                          overflow: "hidden",
                          textAlign: "center",
                        },
                        children: [
                          {
                            type: "p",
                            props: {
                              style: { fontSize: 72, fontWeight: "bold" },
                              children: config.site.title,
                            },
                          },
                          {
                            type: "p",
                            props: {
                              style: { fontSize: 28 },
                              children: config.site.description,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          justifyContent: "flex-end",
                          width: "100%",
                          marginBottom: "8px",
                          fontSize: 28,
                        },
                        children: {
                          type: "span",
                          props: {
                            style: { overflow: "hidden", fontWeight: "bold" },
                            children: new URL(config.site.url).hostname,
                          },
                        },
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
