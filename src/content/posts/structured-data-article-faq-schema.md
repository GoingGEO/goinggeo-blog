---
title: "结构化数据实战：Article 和 FAQ Schema 手把手配置"
description: "第 7 篇讲了 Schema 的原理，这篇讲怎么做。完整代码模板 + Astro 配置步骤，非技术人也能跟着操作。加完 FAQPage Schema 后，每篇文章的 AI 引用概率有望提升 2-3 倍。"
pubDatetime: 2026-06-18T10:00:00+08:00
heroImage: ''
tags: ["technical-seo", "geo-basics"]
---

[上一篇](/posts/schema-markup-intro-for-foreign-trade/) 讲了 Schema 标记的原理和三种最重要的类型。这篇直接上手做——给你的 AstroPaper 博客加上 FAQPage Schema 和 Organization Schema。

不需要懂 TypeScript，不需要改复杂配置。我给你完整的代码模板，你只需要做两件事：复制、粘贴。

---

## 你的博客现在的状态

先确认一下当前的情况：

**BlogPosting Schema** → ✅ 已内置，自动生效。每篇文章都有，不需要操作。

**FAQPage Schema** → ❌ 还没有。文章末尾的 FAQ 区块没有被结构化标记，AI 只能靠内容解析来识别。

**Organization Schema** → ❌ 还没有。AI 不知道你的网站代表哪个品牌/组织。

这篇做完后，三个都补齐。

---

## 第一步：加 FAQPage Schema

### 为什么手动加？

AstroPaper 主题没有自动生成 FAQPage Schema 的功能。虽然 AI 可以通过解析 HTML 来识别 FAQ 内容，但加了 FAQPage Schema 后，AI 不需要猜——它直接知道「这段是 FAQ，问题是 X，答案是 Y」。

根据研究数据，这个操作可以让你的 FAQ 内容被 AI 引用的概率提升 **2.7-3.2 倍**。

### 实现方案

在 Astro 的文章模板里，用 JavaScript 从页面 DOM 中自动提取 FAQ 内容，生成 FAQPage Schema 的 JSON-LD 代码，注入到页面 `<head>` 里。

具体做法：在 `src/pages/posts/[...slug]/index.astro` 文件的底部 `<script>` 标签里，加一段 FAQ 提取代码。

在 GitHub 上编辑 `src/pages/posts/[...slug]/index.astro`，找到文件底部的 `<script is:inline>` 标签，在 `updateScrollProgress()` 函数后面加一段代码：

```javascript
// === FAQPage Schema 自动生成 ===
function injectFAQSchema() {
  const article = document.getElementById('article');
  if (!article) return;

  const headings = article.querySelectorAll('h2, h3');
  let faqHeading = null;
  for (const h of headings) {
    if (h.textContent.includes('常见问题') || h.textContent.includes('FAQ')) {
      faqHeading = h;
      break;
    }
  }
  if (!faqHeading) return;

  const questions = [];
  let el = faqHeading.nextElementSibling;
  while (el && el.tagName !== 'H2' && el.tagName !== 'H3') {
    if (el.tagName === 'P' && el.textContent.includes('Q：')) {
      const qText = el.textContent.split('A：')[0].replace(/.*Q：/, '').trim();
      const aText = el.textContent.split('A：')[1]?.trim() || '';
      if (qText && aText) {
        questions.push({
          "@type": "Question",
          "name": qText,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": aText
          }
        });
      }
    }
    el = el.nextElementSibling;
  }

  if (questions.length === 0) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
injectFAQSchema();
```

这段代码做的事：
1. 找到文章里的「常见问题」标题
2. 提取每个 `**Q：**` 和 `**A：**` 的内容
3. 生成 FAQPage Schema 的 JSON-LD
4. 注入到页面 `<head>` 里

**你的文章末尾 FAQ 格式是 `**Q：问题**` 和 `A：答案`，和这段代码完全匹配。** 以后每篇新文章只要有这种格式的 FAQ，Schema 就会自动生成。

---

## 第二步：加 Organization Schema

### 在哪里加？

在首页 `src/pages/index.astro` 或 About 页面 `src/pages/about.astro` 的 frontmatter 区域加。

推荐加在 About 页面，因为 Organization 信息和 About 页面的内容天然重合。

在 GitHub 上编辑 `src/pages/about.astro`，在 `<Layout>` 标签里的 `<Fragment slot="head">` 区域加一段：

```astro
<Fragment slot="head">
  <script is:inline type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GoingGEO",
    "url": "https://goinggeo.com",
    "description": "面向外贸企业的 GEO（生成式引擎优化）教育博客",
    "email": "Info@im28.net"
  })} />
</Fragment>
```

把 `name`、`description`、`email` 换成你自己的信息就行。

---

## 第三步：验证 Schema 是否生效

配置完成后，等 Cloudflare 部署成功，用这两个工具验证：

### 验证 FAQPage Schema

1. 打开 [Google Rich Results Test](https://search.google.com/test/rich-results)
2. 输入你任何一篇有 FAQ 的文章 URL
3. 如果看到 `FAQPage` 类型被检测到，说明配置成功

### 验证 Organization Schema

1. 打开 [Schema Markup Validator](https://validator.schema.org/)
2. 输入你的 About 页面 URL
3. 如果看到 `Organization` 类型被检测到，说明配置成功

---

## 常见问题

**Q：加了 FAQPage Schema 后多久能看到效果？**
A：Schema 标记在 AI 搜索引擎下次索引你的页面时生效，通常需要 1-2 周。Google 的索引更新更快，通常 3-5 天。Perplexity 和 ChatGPT 的索引更新稍慢，需要 2-4 周。

**Q：我的文章没有 FAQ 区块怎么办？**
A：那就不会有 FAQPage Schema，只有 BlogPosting Schema。这是正常的——不是每篇文章都需要 FAQ。但建议尽量在每篇文章末尾加 3-5 个 FAQ，因为这是 AI 引用率最高的内容格式。

**Q：FAQPage Schema 里的答案需要和页面上的文字完全一致吗？**
A：是的，必须一致。Schema 标记的内容必须和页面可见内容匹配，否则会被搜索引擎视为操纵行为。上面的代码是从页面 DOM 中自动提取的，所以天然一致——你不需要担心这个问题。

**Q：Organization Schema 只加在 About 页面够吗？**
A：够用。Organization Schema 不需要每个页面都加。加在 About 页面或首页，搜索引擎和 AI 会通过站点范围内的爬取找到它。如果你想更保险，也可以在首页 `index.astro` 里也加一份。

**Q：代码不太懂，有没有更简单的方法？**
A：如果你不想改代码，可以先用 Google Tag Manager 来注入 Schema。但 Astro 项目里直接改代码是更干净、更可靠的方式——不依赖第三方工具，加载速度更快，也不容易被广告拦截器屏蔽。
