# 部署说明（DEPLOY）

Wikipie 是**单个 Next.js 项目**，同时承载：

- 个人站 —— 根域名（`wikipie.com`）
- 每个 App 的独立站点 —— 子域名（`<slug>.wikipie.com`，如 `app1.wikipie.com`）

子域名由 `middleware.ts` 把 `<slug>.<root>/<path>` 改写到内部路由 `/apps/<slug>/<path>`，
**不需要为每个 App 单独部署**，一份部署服务所有域名。

---

## 1. 构建与运行

```bash
npm install          # 含 postinstall: fumadocs-mdx 生成 .source
npm run build        # 生产构建（Next 16 / Turbopack）
npm run start        # 启动，监听 3001 端口
# 开发：npm run dev（3001 端口）
```

- Node ≥ 20（项目在 Node 22 验证）。
- `.source/` 是 Fumadocs 生成产物，已 gitignore；CI 构建时由 `postinstall` / Next 插件自动生成。

---

## 2. 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_ROOT_DOMAIN` | 是（生产） | 根域名。**逗号分隔**可配多个，第一个为 canonical。本地不设时默认 `localhost:3001`。 |
| `AHREFS_API_KEY` | 否 | 关键词工具的服务端兜底 Key；通常用户在浏览器 `/settings` 里填，无需服务端配置。 |
| `<PROVIDER>_API_KEY` | 否 | AI 代理 `/api/ai/chat` 的服务端兜底（如 `DEEPSEEK_API_KEY`）；同样可由浏览器提供。 |

示例（生产）：

```bash
# 仅 wikipie.com
NEXT_PUBLIC_ROOT_DOMAIN=wikipie.com

# 多根域名（大陆 + 海外）
NEXT_PUBLIC_ROOT_DOMAIN=wikipie.com,piezora.cn,piezora.com
```

> `NEXT_PUBLIC_` 前缀的变量在**构建时**内联，改了要**重新构建**。

> 注意：`app/layout.tsx` 的 `metadataBase` 与 `app/sitemap.ts`、`app/robots.ts` 里目前硬编码了
> `https://wikipie.com`（用于 canonical / OG / sitemap）。换主域名时一并更新这几处。

---

## 3. 子域名 / DNS

1. **DNS**：为每个 App 子域名加解析记录，指向同一部署。
   - 推荐**泛解析**：`*.wikipie.com` → 部署（这样新增 App 无需改 DNS）。
   - 或逐个：`app1.wikipie.com`、`app2.wikipie.com` …
2. **平台域名绑定**：在托管平台（Vercel 等）把根域名与子域名（或 `*.wikipie.com`）都绑定到本项目，
   并签发证书（泛域名证书）。
3. 多根域名时（`piezora.cn` / `piezora.com`），上述 DNS + 绑定对每个根域名各做一遍，
   并把它们都写进 `NEXT_PUBLIC_ROOT_DOMAIN`。

改写规则（见 `middleware.ts`）：

```
wikipie.com            → 个人站（不改写）
www.wikipie.com        → 个人站
app1.wikipie.com/docs  → 改写到 /apps/app1/docs
app1.piezora.cn/       → 改写到 /apps/app1
```

---

## 4. 本地验证子域名

浏览器会把 `*.localhost` 自动解析到回环地址，无需改 hosts：

```
http://localhost:3001/              个人站
http://app1.localhost:3001/         App One 站点（介绍）
http://app1.localhost:3001/docs     App One 文档
http://app1.localhost:3001/changelog App One 更新日志
```

curl 验证改写（带 Host 头）：

```bash
curl -H "Host: app1.localhost:3001" http://localhost:3001/changelog
```

---

## 5. 新增一个 App

1. 在 `content/apps/apps.config.ts` 的 `apps` 数组加一项（`slug` / `name` / `tagline` /
   可选 `brandColor` / 可选 `external.download` 等）。
2. 建内容目录：`content/apps/<slug>/docs/*.mdx`（侧栏用 frontmatter `order` 排序），
   可选 `content/apps/<slug>/changelog/*.mdx`（每个版本一份，frontmatter `version`/`date`/`title`）。
3. 加 DNS：若用泛解析则**无需任何 DNS 改动**；否则加一条 `<slug>.<root>` 记录。

**无需改任何路由代码。** `slug` 即子域名，`appBaseUrl(slug)`（`lib/app-url.ts`）据此生成跨站链接。

---

## 6. 排查

- **子域名进了个人站 / 404**：确认 `NEXT_PUBLIC_ROOT_DOMAIN` 与实际访问域名一致，且已重新构建；
  确认子域名已绑定到本部署且证书覆盖。
- **App 内链接跳到了个人站**（如点「文档」到了 `/docs` 个人文档）：App 内部链接是**根相对**
  （`/docs`、`/changelog`），必须经子域名访问；不要直接访问内部路径 `/apps/<slug>/...`。
- **改了 `.mdx` 没生效**：开发态由 Next 插件热更；手动可跑 `npx fumadocs-mdx`。
