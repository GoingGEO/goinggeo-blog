---
title: "外贸网站 Schema 标记入门：让 AI 看懂你的页面"
description: "Schema 标记是给 AI 的「翻译层」——把你的页面内容翻译成机器能精准理解的结构化数据。含 FAQPage Schema 的页面，AI 引用率是无 Schema 页面的 2.7 倍。这篇讲清楚原理和做法。"
pubDatetime: 2026-06-17T10:00:00+08:00
heroImage: ''
tags: ["technical-seo", "geo-basics"]
---

你的文章写得很好，AI 也收录了你的页面，但就是不引用你。一个可能的原因：**AI 没看懂你的页面结构**。

AI 搜索引擎处理页面的方式是：先抓取 HTML → 再解析内容结构 → 最后提取可引用的片段。如果你的页面结构模糊——AI 分不清哪段是正文、哪段是 FAQ、哪段是作者信息——它就会跳过你，引用结构更清晰的竞争对手页面。

Schema 标记就是解决这个问题的。它是一段嵌在页面里的结构化数据，用标准化的格式告诉 AI：「这是文章正文，这是 FAQ，这是作者信息，这是产品参数」。

根据多项独立研究的数据：含有 FAQPage Schema 的页面，AI 引用率是无 Schema 同类页面的 **2.7 到 3.2 倍**。这不是微小的提升，是数量级的差距。

---

## Schema 标记是什么？

**Schema 标记（Schema Markup）** 是一种嵌在网页 HTML 中的结构化数据格式，使用 Schema.org 词汇表，以 JSON-LD（一种轻量级数据格式）的形式存在。

它的作用是：让搜索引擎和 AI 不只是「读到」你的内容，而是「理解」你的内容类型和结构。

打个比方：普通 HTML 像是一篇没有目录的文章，AI 需要自己判断哪段是什么。加了 Schema 标记，相当于给文章加了目录和标签——AI 一眼就知道「这是 Article，这是 FAQ，这是 Organization」。

### 和传统 SEO 的关系

传统 SEO 里，Schema 标记的作用是获得 Google 富媒体结果（Rich Results），比如搜索结果里的星级评分、面包屑导航。但 2023 年 8 月之后，Google 限制了 FAQ 富媒体结果的显示范围，只对政府和健康类网站开放。

**但 Schema 标记的价值不但没下降，反而上升了**——因为 AI 搜索引擎（ChatGPT、Perplexity、Google AI Overviews）在索引阶段会处理 Schema 标记，用它来更精准地理解和提取内容。Schema 的主要价值已经从 SEO 富媒体结果，转向了 AI 引用。

---

## 对 GEO 最重要的三种 Schema

### 1. Article / BlogPosting（文章标记）

告诉 AI「这是一篇文章」，包含标题、作者、发布时间、封面图等信息。

你的 AstroPaper 主题**已经内置了 BlogPosting Schema**——在 `PostLayout.astro` 里已经自动生成。你不需要额外操作，每篇文章发布时都会自动带上。

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2026-06-20T10:00:00+08:00"
}
```

### 2. FAQPage（FAQ 标记）

这是 GEO 价值最高的 Schema 类型。它把 FAQ 区块的每个问答对，结构化成 AI 可以直接提取的格式。

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "GEO 和 SEO 有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO 优化页面排名，GEO 优化被 AI 引用的概率。技术层面两者高度重叠，内容层面 GEO 要求命题式写作。"
      }
    }
  ]
}
```

根据 Frase.io 的研究数据，FAQPage Schema 带来的 AI 引用提升约为 **3.2 倍**，HowTo Schema 的提升约为 **38%**。

### 3. Organization（组织标记）

告诉 AI「你的公司/品牌是谁」，包含公司名、网站、logo、联系方式、所在地区。

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "你的公司名",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "description": "一句话描述你的业务"
}
```

Organization Schema 对品牌实体建设至关重要——它帮助 AI 在多个来源中把你网站上的品牌信息和第三方提及关联起来，形成完整的品牌画像。

---

## 外贸网站最应该加 Schema 的页面

| 页面类型 | 推荐 Schema | 为什么重要 |
|----------|------------|------------|
| 博客文章 | BlogPosting（已内置） | AI 引用最频繁的页面类型 |
| FAQ 页面 | FAQPage | AI 引用率最高的内容格式 |
| 关于我们 | Organization | 建立品牌实体，让 AI 认识你 |
| 产品页面 | Product + FAQPage | 采购商搜索时最可能被引用 |
| 首页 | Organization + WebSite | 全站品牌信号 |

---

## AstroPaper 已经做了什么？

好消息：你的 AstroPaper 主题**已经内置了 BlogPosting Schema**。每篇文章发布时，`PostLayout.astro` 会自动在页面 `<head>` 里注入结构化数据。

你可以验证一下：打开 [Google Rich Results Test](https://search.google.com/test/rich-results)，输入你任何一篇文章的 URL，应该能看到 `BlogPosting` 类型的结构化数据被检测到。

**接下来需要手动加的**：
- FAQPage Schema（第 9 篇文章会教你具体配置方法）
- Organization Schema（加在首页或 About 页面）

---

## 验证 Schema 是否正确

三个免费工具，从不同维度验证你的 Schema 是否正确：

**1. Google Rich Results Test**
- 地址：https://search.google.com/test/rich-results
- 用途：验证 Google 支持的 Schema 类型（Article、FAQPage 等）
- 使用方法：输入页面 URL → 点击测试 → 查看检测结果

**2. Schema Markup Validator**
- 地址：https://validator.schema.org/
- 用途：验证所有 Schema.org 类型，不受 Google 限制
- 比 Google 的工具覆盖面更广，适合验证 Organization 等非富媒体类型

**3. Google Search Console**
- 地址：https://search.google.com/search-console
- 用途：监控已部署 Schema 的长期效果和错误
- 在「增强功能」报告里，可以看到哪些页面有 Schema 错误

---

## 常见问题

**Q：Schema 标记需要写代码吗？**

A：BlogPosting 已经由 AstroPaper 自动处理了，你不需要写任何代码。FAQPage 和 Organization Schema 需要手动添加 JSON-LD 代码，但第 9 篇文章会给出完整的代码模板，你只需要替换里面的文字内容就行。

**Q：加了 Schema 就一定能被 AI 引用吗？**

A：不能。Schema 是「加速器」不是「入场券」。它的作用是：如果你的内容质量已经达标，Schema 能让 AI 更快、更准确地提取你的内容，提高被引用的概率。但如果内容本身质量不行，加了 Schema 也没用。

**Q：Schema 标记和前面讲的写作法则有什么关系？**

A：互补关系。写作法则（首句法则、命题式陈述等）优化的是「内容本身的可引用性」——让 AI 想引用你。Schema 标记优化的是「内容结构的可解析性」——让 AI 能引用你。两者缺一不可。

**Q：不加 Schema 会被 AI 惩罚吗？**

A：不会。没有 Schema 的页面也会被 AI 正常抓取和引用。但你的竞争对手如果加了 Schema，他们的内容在同等条件下被引用的概率会更高。GEO 是相对竞争——你不一定要做到完美，但要比竞争对手好。

**Q：Schema 标记写错了会有什么后果？**

A：轻微错误会被搜索引擎忽略，不会惩罚。但如果 Google 检测到故意操纵（比如页面没有 FAQ 内容却标了 FAQPage Schema），可能会收到手动操作处罚。原则是：**Schema 标记必须和页面可见内容一致**，标记了什么类型，页面就必须有对应的内容。
