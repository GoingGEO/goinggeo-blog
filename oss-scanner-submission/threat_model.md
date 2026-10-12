# GoingGEO Blog — 威胁模型（Threat Model）

> 用途：作为提交给 Anthropic OSS Scanner 的 `threat_model.md`，说明这个仓库
> 的攻击面与已有缓解措施。结论先行：**这是一个低风险静态站点**，
> 最大（也是唯一值得扫的）攻击面是**依赖供应链**——这正是 OSS Scanner 能帮到的部分。

## 1. 资产（Assets）

| 资产 | 说明 | 敏感度 |
|---|---|---|
| 站点源码（MDX 文章、Astro 配置） | 全部公开内容，本就对外发布 | 低 |
| 构建产物 → Cloudflare Pages | 静态 HTML/CSS/JS | 低 |
| Cloudflare Pages Functions（联系表单） | 接收访客留言，经 Resend 发信到 info@im28.net | 中 |
| 环境变量：Resend API Key | 仅存在于 Cloudflare 侧，**不进仓库** | 高（但已隔离） |

## 2. 攻击面（Attack Surface）

1. **依赖供应链（最高优先级，OSS Scanner 覆盖）**
   - 40+ npm 包（astro 6.4.2、tailwind、sharp、satori、pagefind 等）。
   - 风险：某个 transitive 依赖被投毒 / 出现 RCE 漏洞。
   - 现状缓解：pnpm-lock.yaml 锁定精确版本；但**从未做过自动化漏洞扫描**。
2. **内容注入 / XSS**
   - 文章为作者自写 MDX，无 UGC，风险低。
   - 缓解：Astro 默认转义；联系表单输入在服务端只做转发、不回显。
3. **构建/部署管线**
   - 风险：CI 被篡改注入恶意脚本。
   - 缓解：Cloudflare Pages 自动构建，无自管 runner。
4. **联系表单滥用**
   - 风险：垃圾邮件 / 探测 Resend 配额。
   - 缓解：CF Functions 仅转发，无数据库写入；可加速率限制（待办）。

## 3. 缓解措施清单

- [x] 依赖版本锁定（pnpm-lock.yaml）
- [x] 无密钥入库（Resend Key 在 Cloudflare 环境变量）
- [x] 无服务端运行时（纯静态 + 单函数）
- [ ] **本次新增：提交 OSS Scanner 做依赖漏洞审计**
- [ ] 待办：联系表单加速率限制 + 基础字段校验
- [ ] 待办：部署后跑一次 `pnpm audit` 作为 CI 兜底

## 4. 提交 OSS Scanner 的预期产出

拿回一份**已知漏洞依赖清单**（CVE / GHSA），按严重度排序。
对静态站而言大概率结果为"无高危"，但这份证据本身可以：
1. 作为 goinggeo 一篇 GEO 标杆文素材（"我们如何给自己的站点做 AI 安全审计"——检索不到的独有经验）；
2. 在客户问"你们站点安全吗"时给出口实。
