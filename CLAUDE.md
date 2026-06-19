# CLAUDE.md

**Wikipie** (`ahrefs-next`) — a personal, Chinese-language website that bundles, in **one
Next.js App Router project**: a personal site (home + blog + docs) on the root domain, an SEO
**tools** suite, and a **standalone site per App** on its own subdomain (intro + docs +
changelog, where 文档 and 更新日志 are parallel tabs; there is no per-App blog — App announcements
go to the personal blog). Core principle: **adding an App = one config entry + a content
directory, with zero route-code changes.** Single-user, no auth, no backend DB — tool credentials
live in the browser. **Deployment / subdomain / DNS setup lives in [DEPLOY.md](./DEPLOY.md).**

## Stack

- **Next.js 16** App Router (**Turbopack**), **React 19**, **TypeScript** (strict). RSC enabled.
- **Tailwind CSS v4** — CSS-first config via `@theme inline` in `app/globals.css`. There is **no**
  `tailwind.config.ts` (despite `components.json` referencing one).
- **Fumadocs 16** (`fumadocs-core` + `fumadocs-mdx`) as the MDX content pipeline for **all** docs
  and blog content (personal + per-app). We use the content pipeline + Shiki + TOC, and render
  with our **own** design-system components — `fumadocs-ui` is **not** installed.
- **shadcn/ui** primitives on **`@base-ui/react`** (not Radix). Icons: **`lucide-react`**.
- **`next-themes`** for light/dark. Fonts: **Geist Sans** + **Geist Mono** via the `geist`
  package (`geist/font/sans` + `geist/font/mono`).
- `xlsx` for spreadsheet import/export in the keyword tool.
- Dev server: **port 3001** (`npm run dev`). Build: `npm run build`. Lint: `npm run lint`.

## Two kinds of site (subdomain split)

The personal site and each App are **separate sites** with separate chrome:

- **Personal site** — the root domain (`wikipie.com`). Routes live in the `app/(site)/` route
  group, wrapped by `SiteShell` (global `SiteNav` + `SiteFooter`).
- **App site** — each App is its own site at `<slug>.<root>` (e.g. `app1.wikipie.com`).
  `middleware.ts` rewrites `<slug>.<root>/<path>` → the internal `/apps/<slug>/<path>` route.
  App routes are wrapped by `AppShell` (the App's own nav with parallel tabs + footer), **not**
  the global nav. Root domain(s) come from `NEXT_PUBLIC_ROOT_DOMAIN` (comma-separated; defaults to
  `localhost:3001`, where `app1.localhost:3001` works for local dev).

```
# Personal site (root domain), in app/(site)/
/                                  personal home
/blog                /blog/[slug]  personal blog
/docs/[[...slug]]                  personal docs (sidebar + TOC)
/tools               /tools/[slug] tools hub + a tool
/apps                              App overview (cards link out to App subdomains)
/settings                          unified API-key management
/og  /sitemap.xml  /robots.txt     SEO endpoints

# App site (<slug>.<root>), internal route /apps/[app]/*
/            (→ /apps/[app])           App intro (hero) — tab 介绍
/docs/...    (→ /apps/[app]/docs/...)  App docs (sidebar + TOC) — tab 文档
/changelog   (→ /apps/[app]/changelog) version timeline — tab 更新日志
```

**文档 and 更新日志 are parallel** top-level tabs in the App nav (not changelog-nested-in-docs).
App-internal links are **root-relative** (`/docs`, `/changelog`) because the App is served at its
subdomain root; cross-site links use `appBaseUrl(slug)` from `lib/app-url.ts`. An App shows docs
iff it has docs content (`appHasDocs`) and changelog iff `appHasChangelog`. All
blog/docs/tool/app pages are **SSG** via `generateStaticParams`.

## Directory layout (consolidated — keep it this way)

`app/` holds **only** routes, `app/api/*` route handlers, and `globals.css`. All other code lives
at the **root** in `lib/` and `components/`. Do not reintroduce `app/lib`, `app/components`, or
`app/context`.

- `app/` — routes + layouts. `app/(site)/` route group = personal site (home, blog, docs, tools,
  settings); `app/apps/[app]/` = App sites (wrapped by `AppShell`); `app/apps/page.tsx` = overview
  (wraps `SiteShell` itself). `app/api/<name>/route.ts` (`runtime = "nodejs"`). `middleware.ts` at
  repo root handles subdomain rewrites.
- `content/` — all MDX + the App registry, separated from code:
  - `content/blog/*.mdx`, `content/docs/*.mdx` (+ `meta.json` for sidebar order)
  - `content/apps/apps.config.ts` — **App registry (single source of truth)**
  - `content/apps/<slug>/docs/*.mdx` (sidebar via `order`) and `content/apps/<slug>/changelog/*.mdx`
    (one MDX per version: `version`, `date`, `title`)
- `components/` — `ui/` (shadcn primitives), `nav/`, `footer/`, `theme/`, `layout/` (`SiteShell`),
  `docs/`, `blog/`, `app/` (App-site chrome: `AppShell`/`AppSiteNav`/`changelog-timeline`/…),
  `mdx/`, `context/` (client providers), `tools/` (the SEO tool feature components).
- `lib/` — `apps.ts`, `content.ts`, `source.ts`, `seo.ts`, `format.ts`, `app-url.ts` (subdomain
  URLs + `ROOT_DOMAINS`), `utils.ts` (just `cn()`), plus tool domain logic: `ahrefs.ts`, `ai/`,
  `countries.ts`, `languages.ts`, `schema-types.ts`.
- `source.config.ts` — Fumadocs content-source definitions. `.source/` is generated & gitignored.
- Path alias `@/*` → repo root: `@/lib/...`, `@/components/...`, `@/content/...`.

## Config-driven Apps (core mechanism)

`content/apps/apps.config.ts` is the only source of truth. `AppConfig`: `slug`, `name`,
`tagline`, optional `brandColor`, optional `external`. (No `nav` field — docs presence is inferred
from content.)

- `lib/apps.ts` — `getApp(slug)` / `getAllApps()`. `appHasDocs(slug)` / `appHasChangelog(slug)` /
  `getAppChangelog(slug)` live in `lib/content.ts`.
- `app/apps/[app]/layout.tsx` reads the config (`notFound()` if missing) and renders `AppShell`,
  which injects `brandColor` as the CSS var `--brand` for that App's subtree.
- The docs/changelog routes 404 when the App lacks that content.
- **Add an App**: append to the `apps` array + create `content/apps/<slug>/docs/` (and optionally
  `changelog/`). No route code. For its own subdomain, add a DNS record → the deployment; the
  middleware already maps `<slug>.<root>`.

## Content system (Fumadocs)

- `source.config.ts` defines sources: `docs` (`defineDocs`, personal, with page tree), `blog`
  (personal), `appDocs` (glob `content/apps/*/docs/**`) and `appChangelog` (glob
  `content/apps/*/changelog/*`). App content is filtered by slug in `lib/content.ts`.
- `lib/content.ts` is the **only** place that imports the generated `@/.source/server`. It
  derives per-App slugs from each entry's `info.path` (e.g. `app1/docs/configuration.mdx`).
- `lib/source.ts` builds the personal docs `loader()` (sidebar tree + `getPage`/`generateParams`).
- MDX is rendered by `components/mdx/mdx-content.tsx` inside the `.prose` wrapper; Shiki dual-theme
  highlighting comes from `source.config.ts` (`github-light` / `github-dark`).
- Frontmatter convention: `title`, `description`, `date`, `tags`; docs also use `order`.
- `.source` is regenerated automatically by the Next plugin (`createMDX` in `next.config.mjs`);
  run `npx fumadocs-mdx` to regenerate manually.

## Design system (Vercel **Geist** — https://vercel.com/design)

- The design system **is Geist**. Semantic tokens map onto Geist's grayscale + blue accent; pull
  the spec from `https://vercel.com/design.md` (light) and `/design.dark.md` (dark) if extending.
- **All tokens live in `app/globals.css`**: raw CSS vars in `:root` / `:root.dark` (light+dark),
  bridged into Tailwind utilities under `@theme inline`. Brand accent is **Geist blue `#006bff`**
  (`#006efe` in dark). Dark surfaces are true black (`#000`). Geist color-step intent: 100 bg ·
  400 border · 700 solid fill · 900 secondary text · 1000 primary text. Shadows stay subtle
  (borders carry hierarchy, especially in dark); radii are tight (6 / 12 / 16).
- Use semantic utilities: `bg-bg`, `bg-bg-subtle`, `bg-bg-card`, `text-fg`, `text-fg-muted`,
  `text-fg-subtle`, `border-border`, `bg-brand`, `text-brand`, `bg-brand-soft`. Legacy shadcn
  names (`bg-background`, `bg-primary`, …) are aliased to the same tokens so `ui/*` keeps working.
- **Never hard-code hex/oklch in components** — always go through tokens.
- Dark mode is first-class (two token sets from the start), toggled via `next-themes` (`.dark`
  class on `<html>`; `suppressHydrationWarning` is set).
- Visual language: generous whitespace, soft large radii, `shadow-sm` → `hover:shadow-md` with a
  subtle `hover:-translate-y-0.5` lift, sticky `backdrop-blur` nav, content capped at `--page-max`
  (1440px), reading width `--content-max` (800px). MDX prose styled via `.prose` in globals.css.
- One font family for headings + body (Inter); hierarchy via weight/size. No multi-font stacks, no
  big color-block backgrounds, no heavy animations.

## Tool credentials (the SEO tools)

- **Nothing is persisted server-side.** Keys live in browser `localStorage`, sent per-request.
- Ahrefs: `ApiKeyContext` → header; route falls back to `process.env.AHREFS_API_KEY`.
- AI: `AiKeysContext` stores `{ providerId: key }` + a selected provider. All AI calls go through
  the **single proxy** `/api/ai/chat` (key via `x-ai-key` header). Client helper: `aiChat()` in
  `lib/ai/client.ts`; parse model JSON with `extractJson()`. Providers declared once in
  `lib/ai/providers.ts` (DeepSeek default, + OpenAI, Anthropic, Gemini), each with a `protocol`.
- New AI tools gate on `hasActiveKey` and render `<AiStatusHint>` when no key is set.
- The 5 tools (`keywords`, `eeat`, `slug`, `schema`, `ui-translate`) are a registry in
  `app/tools/registry.ts`; bodies are wired in `app/tools/[slug]/tool-body.tsx`.

## UI language & copy

- Product UI is **Simplified Chinese** (`<html lang="zh-CN">`); user-facing strings, labels,
  errors, toasts are in Chinese. Tools/Apps show an English subtitle (mono). Global nav labels
  (Blog/Docs/Tools/Apps) are English by convention.
- Code, comments, identifiers, commit messages are in English; comments sparse, section-style
  (`/* ─── … ─── */`).

## Commit style

Conventional Commits, lowercase, often scoped: `feat(apps): …`, `fix: …`, `feat(docs): …`.

## Gotchas

- **Next 16 async params**: `params` (and `searchParams`) are `Promise`s in pages/layouts/
  `generateMetadata` — `await` them. `generateStaticParams` stays sync.
- Base UI `<Button>` composes with `<Link>`/`<a>` via the **`render`** prop (not `asChild`); the
  wrapper sets `nativeButton={false}` automatically when `render` is used.
- Fumadocs is **version-locked** to React 19 / Next 16 (`fumadocs-core` + `fumadocs-mdx` v16). The
  generated runtime is `@/.source/server` (async exports); entries expose `body`, `toc`, and
  `info.path`. Downgrading Next/React will break the content pipeline.
- Ahrefs returns **lowercase** country codes — normalize to uppercase to match `COUNTRY_MAP`.
- Batch keyword queries throttle ~300ms between calls; keep that guard.
- Tool feature components in `components/tools/` import siblings with **relative** paths — move
  them as a group.
- Internal links use **relative paths** (`/apps/${slug}/…`) — never hard-code the domain (keeps
  future subdomain migration open).
- Vercel's Web Interface Guidelines are installed as the `/web-interface-guidelines` command.
