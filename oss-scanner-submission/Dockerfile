# OSS Scanner 用 Dockerfile
# 目的：让扫描器能解析出完整依赖树（pnpm-lock.yaml 已锁定版本）。
# 不需要完整 build，但装依赖即可触发 scanner 的 SBOM/漏洞分析。
FROM node:22-bookworm-slim AS base
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 只装依赖即可（不构建，省时）
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 把源码也拷进去，保证 scanner 能关联 package 到源文件
COPY . .

# 可选：真要跑 build 验证再取消下一行注释
# RUN pnpm run build
