import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
  url: "https://goinggeo.com",
  title: "GEO 优化指南",
  description: "生成式引擎优化（GEO）知识普及与实操教学",
  author: "GoogingGEO.com",
  profile: "https://goinggeo.com/about/",
  ogImage: "default-og.jpg",
  lang: "en",
  timezone: "Asia/Shanghai",
  dir: "ltr",
},
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/GoingGEO/goinggeo-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/GoingGEO" },
    { name: "mail",     url: "mailto:Info@Im28.net" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
