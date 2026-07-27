---
title: "robots.txt 和 llms.txt：AI 爬虫配置完全指南"
description: "robots.txt 管的是“传统爬虫能不能抓”，llms.txt 管的是“AI 模型该怎么读你的网站”。本文讲清两者区别、llms.txt 的标准写法、AstroPaper 站点的配置方法，以及最常见的配置错误。"
pubDatetime: 2026-08-15T09:00:00+08:00
heroImage: ''
tags: ["technical-seo", "geo-basics"]
---

robots.txt 和 llms.txt 都是放在网站根目录的“说明文件”，但它们服务的对象不同：robots.txt 告诉传统搜索引擎爬虫“能不能抓”，llms.txt 告诉生成式 AI“应该怎么读我的内容”。在 GEO（生成式引擎优化）语境下，后者的重要性正在快速上升。本文讲清三件事：robots.txt 对 AI 爬虫到底管不管用、llms.txt 应该怎么写、以及像 GoingGEO 这样的 AstroPaper 静态站怎么落地配置。

robots.txt 是 1994 年制定的爬虫排除标准，用 Disallow / Allow 指令控制搜索引擎蜘蛛的抓取范围。llms.txt 是 2024 年由 Anthropic 提出的、面向大语言模型的站点说明文件，用 Markdown 格式列出“本站最重要的内容与阅读顺序”。

## robots.txt 对 AI 爬虫：能拦，但管不了“怎么读”

传统搜索引擎（Google、Bing）会严格遵守 robots.txt。但 AI 爬虫的情况复杂得多：GPTBot、ClaudeBot、PerplexityBot、Google-Extended 各自有 bot 名称，是否遵守 robots.txt 取决于各家政策，且是“自愿”性质。

更关键的是，即使 robots.txt 成功阻止了抓取，它也做不到两件 GEO 关心的事：第一，它无法“引导” AI 优先阅读你最想被引用的页面；第二，它管不了对方已经缓存或训练过的历史内容。所以 robots.txt 在 GEO 里的作用是“边界管理”（阻止低价值页面被抓、控制抓取成本），而不是“内容引导”。

如果你想精确管理 AI 爬虫，需要在 robots.txt 里显式声明对应的 bot 名。例如允许 Google 的 AI 抓取、拒绝其他：

```
User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
```

注意不同 AI 公司的 bot 名称要分别写，用一个笼统的 `Disallow: /` 会连传统搜索也一起屏蔽，反而伤 SEO。

## llms.txt：给 AI 的一份“内容地图”

llms.txt 不是强制协议，而是一份放在根目录、用 Markdown 写的“内容说明书”。它的逻辑是：与其让 AI 自己瞎抓，不如主动告诉它“我这里有一套关于外贸 GEO 的体系化内容，请从这篇总纲开始读，下面这些子话题分别在哪里”。

对 GEO 来说，这个价值很直接——AI 在回答“外贸企业怎么做 GEO”时，如果你的 llms.txt 清晰列出了支柱页和集群页，模型就更可能把你的内容当成“这个主题的权威来源”来引用，而不是只抓到一篇零散文章。

## llms.txt 的标准写法

一个规范的 llms.txt 结构是：

```
# GoingGEO

> 面向外贸企业的 GEO（生成式引擎优化）知识库，提供从入门到实操的体系化内容。

## 核心内容
- [外贸GEO完全指南](https://goinggeo.com/posts/foreign-trade-geo-complete-guide/)：外贸企业做 GEO 的总纲与整体框架。
- [什么是 GEO](https://goinggeo.com/posts/what-is-geo/)：GEO 的定义、与 SEO 的区别、适用场景。
- [6 大 AI 搜索平台](https://goinggeo.com/posts/ai-search-engines-for-foreign-trade/)：ChatGPT、Perplexity、Google AI Overviews 等平台的引用逻辑。

## 可选资源
- [llms-full.txt](https://goinggeo.com/llms-full.txt)：全站内容索引。
```

要点：第一行的 H1 是站点名；紧接着一段摘要说明“这个站是干什么的”；然后用列表列出关键页面，每条带链接和一句话说明；可选块放次要资源。链接务必用绝对 URL 且可访问。

你也可以提供一个 llms-full.txt，里面是“全站文章的标题 + 链接 + 摘要”索引，方便 AI 一次性获取你的全部内容脉络。

## AstroPaper 站点怎么配置

GoingGEO 用的是 AstroPaper（基于 Astro 的静态博客）。静态站点的好处是：任何放到 `public/` 目录的文件，构建后都会原样输出到网站根目录。所以配置 llms.txt 只需要一步：

1. 在仓库的 `public/` 目录下新建 `llms.txt`；
2. 按上面的结构写入内容；
3. 提交并部署，访问 `https://goinggeo.com/llms.txt` 即可看到。

不需要改任何组件或配置文件。如果你想要 llms-full.txt，也可以手动维护一份全站索引放进去，或者后期用脚本自动生成。

想了解 AI 怎么“看”你的网站，可以先读 [AI 可见性审计](/posts/ai-visibility-audit-for-foreign-trade/) 那篇，再用 llms.txt 把审计结论固化成一份机器可读的说明。

## 最常见的 5 个配置错误

1. **把 llms.txt 当成拦截工具**：它不是 robots.txt，写了不会阻止任何抓取，只是“建议”。想拦截要用 robots.txt。
2. **写一堆营销话术没有实质链接**：AI 需要的是“去哪里读什么”，不是公司简介。列表里的每条都应该是可点击、有说明的链接。
3. **链接失效或用相对路径**：llms.txt 里最好用绝对 URL，相对路径在脱离页面上下文时 AI 可能无法解析。
4. **和 robots.txt 自相矛盾**：你在 llms.txt 里隆重推荐一篇支柱页，结果 robots.txt 把它 Disallow 了——AI 想读也读不到。
5. **忘了同步管理 AI bot**：只配 llms.txt 不配 robots.txt，等于只“引导”不“设边界”，低价值页面照样被抓，浪费抓取预算。

## 两者怎么配合

一句话：robots.txt 负责“边界”（哪些 AI 能抓、哪些页面不值得抓），llms.txt 负责“引导”（AI 应该优先读哪些内容、按什么顺序）。在 GEO 策略里，建议先理清 robots.txt 的 AI bot 规则，再写一份结构清晰的 llms.txt，把你的支柱页和核心集群页主动推到 AI 面前。

**Q：llms.txt 是强制标准吗？不写会不会被惩罚？**

A：不是强制标准，目前没有搜索引擎因为“没有 llms.txt”而惩罚网站。它是一份“礼貌且高效”的内容说明书，写了能让 AI 更容易、更准确地理解你的内容结构，属于加分项而非必选项。

**Q：robots.txt 能完全阻止 AI 抓取我的网站吗？**

A：不能完全保证。传统搜索引擎会遵守，但 AI 爬虫是否遵守取决于各家公司的政策，且是自愿性质。即使屏蔽了抓取，对方已经缓存或训练过的历史内容也不受控制。robots.txt 适合做“边界管理”，而非内容保护。

**Q：llms.txt 和 sitemap.xml 有什么区别？**

A：sitemap.xml 是给传统爬虫的“页面清单”，主要解决“有哪些页面、什么时候更新”。llms.txt 是给 AI 模型的“内容导读”，重点解决“哪些内容最重要、按什么顺序读、彼此什么关系”。两者互补，不冲突。

**Q：AstroPaper 站点一定要用代码改配置才能加 llms.txt 吗？**

A：不需要。AstroPaper 是静态站，把 llms.txt 放到仓库的 public/ 目录，构建后会自动输出到网站根目录，无需改任何组件或配置。

**Q：llms.txt 里应该列多少页面合适？**

A：建议只列“最核心”的 5 到 15 个页面——支柱页、主要集群页、最重要的工具或资源。列太多会稀释重点，失去“导读”的意义。全站细节可以放在 llms-full.txt 里。

**Q：能不能用 llms.txt 引导 AI 只引用我、不引用竞争对手？**

A：不能。llms.txt 只能描述“你自己的网站有什么”，无法指定 AI 的引用偏好。它提升的是你被准确理解的概率，而不是排他性。

**Q：llms.txt 需要经常更新吗？**

A：当你新增了重要的支柱页或集群页时，应该同步更新 llms.txt，把新内容加进“核心内容”列表。一般每季度或每次大版本内容更新时检查一次即可，不需要每天改。
