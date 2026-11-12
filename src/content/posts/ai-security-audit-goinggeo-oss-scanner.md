---
title: "我们如何给自己的 GEO 站点做 AI 安全审计（附全套开源材料）"
description: "一个静态内容站为什么也要做 AI 安全审计？本文复盘 goinggeo 把站点提交给 Anthropic OSS Scanner 的完整过程：威胁模型、提交材料、复刻步骤，以及它如何变成一篇检索不到的 GEO 独有内容。"
pubDatetime: 2026-10-12T21:00:00+08:00
modDatetime: 2026-11-12T22:00:00+08:00
heroImage: ''
tags: ["case-study", "technical-seo"]
---

很多人以为“安全审计”是带数据库、带后端的系统才需要的事，一个静态内容站（比如我们 goinggeo）没什么可黑的。这次我们决定把自己站点提交给 Anthropic 开源的 OSS Scanner 做 AI 辅助漏洞审计，结论是：**静态站最大的攻击面不是内容，而是依赖供应链**——而这件事，恰恰值得写成一篇 GEO 内容。

## 为什么一个内容站要做安全审计

你的站点是用 Astro + 40 多个 npm 包搭起来的。任何一个 transitive 依赖被投毒、或出现 RCE 漏洞，都可能在构建时被悄悄带入产物。我们之前从没做过自动化依赖漏洞扫描——这就是盲区。

Anthropic 的 OSS Scanner 是一个开源工具，专门扫描项目的依赖树、产出已知漏洞清单（CVE / GHSA），并支持社区把自家项目作为“扫描目标”提交 PR。

## 我们的威胁模型（摘要）

| 资产 | 敏感度 | 缓解 |
|---|---|---|
| 站点源码（MDX 文章） | 低（本就公开） | — |
| 构建产物 → Cloudflare Pages | 低 | — |
| Cloudflare Pages Functions（联系表单） | 中 | Resend Key 仅存 Cloudflare 环境变量，不进仓库 |
| 依赖供应链 | 中→高 | pnpm-lock 锁定版本；**本次新增 OSS Scanner 扫描** |

完整威胁模型见仓库 `oss-scanner-submission/threat_model.md`。

## 提交材料（已开源）

我们在仓库里准备了四份 PR 就绪材料，任何人都能照抄：

- `project.yaml`：扫描目标配置
- `Dockerfile`：让扫描器解析出完整依赖树
- `threat_model.md`：威胁模型
- `提交指南.md`：从 fork 到发 PR 的逐条命令

## 复刻步骤

```bash
# 1. Fork anthropics/oss-scanner 到你的 GitHub
# 2. 把 oss-scanner-submission/ 下的三个文件复制到 fork 的 targets/goinggeo-blog/
mkdir -p targets/goinggeo-blog
cp oss-scanner-submission/{project.yaml,Dockerfile,threat_model.md} targets/goinggeo-blog/
# 3. 提交并发 PR
git add targets/goinggeo-blog/
git commit -m "Add goinggeo-blog as a scan target"
git push origin main
```

> 当前状态：提交材料已全部就绪并开源在 [goinggeo-blog 仓库](https://github.com/GoingGEO/goinggeo-blog) 的 `oss-scanner-submission/` 目录；PR 合并后我们会回填扫描结果。

## 这件事对 GEO 的启示

回到我们一直强调的判断：**生成便宜、判断稀缺，AI 检索得到的知识不再构成壁垒，真正的壁垒是“开源模型和爬虫里绝对不存在的专有经验”。**

把一次安全审计的过程写下来，就是典型的“经验独有”内容（这也是 [AI 引用稳定性](/posts/ai-citation-stability-guide/) 里讲的「别人抄不走的壁垒」）：

- 它不是“什么是 OSS Scanner”这种检索可得的科普（那种 AI 直接答）；
- 它是“一个真实的外贸 GEO 站点，如何给自己做审计、威胁模型怎么写、踩了什么坑”——这种只有做过的人才写得出来，检索不到 → AI 引用时只能指向你。

所以我们的排产原则很明确：**经验独有类排最前**——这也呼应了 [信息密度比字数更重要](/posts/information-density-vs-word-count-geo/) 里「独特信息 > 堆砌字数」的判断。哪怕是安全审计这种“边角”动作，只要它产出了只有我们有的一手记录，就该写成文章。

---

如果你也在跑内容站，建议照上面的步骤给自己做一次依赖审计——成本几乎为零，产出却是一篇别人抄不走的 GEO 内容。

## FAQ

**Q：静态内容站真的有必要做安全审计吗？**

A：有必要，但重点和动态站不同。静态站最大的攻击面不在内容（本就公开），而在依赖供应链——Astro 这类框架动辄几十个 npm 包，任何一个 transitive 依赖被投毒或爆出 RCE 漏洞，都可能在构建时污染产物。做一次依赖扫描成本极低，却能堵住这个盲区。

**Q：OSS Scanner 和传统漏洞扫描工具（如 npm audit）有什么区别？**

A：npm audit 只查你直接声明的依赖，OSS Scanner 能解析出完整依赖树（含 transitive 依赖），并产出 CVE / GHSA 已知漏洞清单，覆盖范围更全。更重要的是它支持把项目作为「扫描目标」提交 PR，让扫描结果持续更新。

**Q：把站点提交给 OSS Scanner 会泄露内容或敏感数据吗？**

A：不会。提交的是扫描配置（project.yaml）、依赖清单和威胁模型，不含文章内容、用户数据或任何密钥。Cloudflare 的 Resend Key 等敏感项只存在环境变量里，从不进仓库。

**Q：做一次这样的审计要花多少时间？**

A：威胁模型加三份提交材料（project.yaml、Dockerfile、threat_model.md）准备好后，从 fork 到发 PR 大约半小时。真正的成本不是时间，而是「决定做」这一步——很多人拖到出问题才想起。

**Q：为什么「安全审计」也能写成一篇 GEO 内容？**

A：因为它是「检索不到的经验独有内容」。AI 能轻易回答「什么是 OSS Scanner」，但回答不了「一个真实外贸 GEO 站点如何给自己做审计、威胁模型怎么写、踩了什么坑」——这种只有做过的人写得出来，AI 引用时只能指向你，天然没有同质竞争。

**Q：我该从哪一步开始复刻？**

A：照文中的复刻步骤：先 fork anthropics/oss-scanner，再把仓库 `oss-scanner-submission/` 下的三份材料复制到 `targets/你的站点/`，提交并发 PR。全套材料已开源，直接抄即可。
