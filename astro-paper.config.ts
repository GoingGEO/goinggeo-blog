import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
  url: "https://goinggeo.com",
  title: "GoingGEO.com",
  description: "生成式引擎优化（GEO）知识普及与实操教学",
  author: "GoingGEO 团队",
  profile: "https://goinggeo.com/about/",
  ogImage: "default-og.jpg",
  lang: "zh-CN",
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
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
      url: "https://github.com/GoingGEO/goinggeo-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "mail",     url: "mailto:Info@Im28.net" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
