# CLAUDE.md

SEO Toolkit (`ahrefs-next`) — a personal, Chinese-language web app bundling several SEO utilities:
keyword research (via the Ahrefs API), plus AI-powered tools (E-E-A-T evaluation, slug
generation, Schema/JSON-LD builder, UI-copy translation). Single-user, no auth, no backend DB —
all credentials live in the browser.

## Stack

- **Next.js 14.2** App Router, **React 18**, **TypeScript** (strict). RSC enabled.
- **Tailwind CSS v4** (CSS-first config via `@theme` in `app/globals.css` — there is **no**
  `tailwind.config.ts` despite `components.json` referencing one).
- **shadcn/ui** primitives built on **`@base-ui/react`** (not Radix). Style preset `base-nova`,
  base color `neutral`, icons from **`lucide-react`**.
- **Geist** font (sans + mono) via `geist/font`.
- `xlsx` for spreadsheet import/export in the keyword tool.
- Dev server runs on **port 3001** (`npm run dev`). Build: `npm run build`. Lint: `npm run lint`.

## Layout & conventions

- Path alias `@/*` maps to repo root. Imports use `@/app/...`, `@/components/ui/...`, `@/lib/utils`.
- `app/` — routes, plus app-local code:
  - `app/tools/<tool>/page.tsx` — thin server-component page that renders a client component
    inside `<ToolShell>` (provides header, breadcrumb, title block, footer). Follow the existing
    pattern: page is a server component, the interactive work lives in `app/components/<Tool>.tsx`
    marked `"use client"`.
  - `app/components/` — feature/page components (PascalCase). `app/context/` — React contexts.
  - `app/lib/` — domain logic (`ahrefs.ts`, `ai/`, `countries.ts`, `languages.ts`, `schema-types.ts`).
  - `app/api/<name>/route.ts` — Route Handlers (`export const runtime = "nodejs"`).
- `components/ui/` — generic shadcn primitives (lowercase filenames). `lib/utils.ts` — only `cn()`.
- `/` redirects to `/tools`. The tool registry (cards on the hub) lives in `app/tools/page.tsx` —
  add new tools there.

## Credentials (important)

- **Nothing is persisted server-side.** Keys live in the browser's `localStorage` and are sent
  per-request via headers.
- **Ahrefs**: `ApiKeyContext` → sent as a header; route falls back to `process.env.AHREFS_API_KEY`.
- **AI providers**: `AiKeysContext` stores a `{ providerId: key }` map (`LS_AI_KEYS`) plus a
  selected provider (`LS_AI_SELECTED`). The chat proxy `app/api/ai/chat/route.ts` reads the key
  from the `x-ai-key` header (falls back to `<PROVIDER>_API_KEY` env var).
- All AI calls go through the **single proxy** `/api/ai/chat`. Client helper: `aiChat()` in
  `app/lib/ai/client.ts`; use `extractJson()` to parse model JSON output. Never call provider
  APIs directly from the browser.
- Providers are declared once in `app/lib/ai/providers.ts` (DeepSeek default, plus OpenAI,
  Anthropic, Gemini), each with a `protocol` (`openai` | `anthropic` | `gemini`). Add a provider
  by appending to `AI_PROVIDERS`; add a protocol by adding a `call*` branch in the chat route.
- The unified settings UI is `/settings`. New AI tools should gate on `hasActiveKey` and render
  `<AiStatusHint>` when no key is set.

## Design system

- **Theme tokens** are defined in `app/globals.css` under `@theme inline` as `--color-*` /
  `--radius-*`. Use semantic Tailwind classes (`bg-background`, `text-muted-foreground`,
  `border-border`, `bg-primary`, etc.) — **never hard-code hex/oklch in components**.
- Brand primary is `#533AFE` (indigo/violet). Colors are mostly OKLCH neutrals.
- Visual language: light, airy, lots of `muted/40` page backgrounds, `rounded-xl`/`rounded-2xl`
  cards with `shadow-sm` → `hover:shadow-md`, subtle `hover:-translate-y-0.5` lifts,
  `backdrop-blur-xl` sticky headers, content capped at `max-w-6xl`, generous padding.
- Component styling uses **`cva`** variants + `cn()` for merging (see `components/ui/button.tsx`).
  Match the existing variant/size taxonomy rather than adding ad-hoc class soups.
- Status accents: emerald for "available/configured", amber (pulsing) for "needs setup".

## UI language & copy

- **The product UI is Simplified Chinese** (`<html lang="zh-CN">`). All user-facing strings,
  labels, errors, and toasts are in Chinese. Each tool also shows an English subtitle (`nameEn`,
  rendered in mono). Match this bilingual pattern for new tools.
- Code, comments, identifiers, and commit messages are in English. Comments are sparse and
  section-style (`/* ─── … ─── */`).

## Commit style

Conventional Commits, lowercase, often scoped: `feat(keywords): …`, `fix: …`,
`feat(ui-translate): …`. Keep them concise; group related changes.

## Gotchas

- Base UI `<Button>` uses a **`render` prop** to compose with `<Link>` (e.g.
  `<Button render={<Link href="…" />}>`), not `asChild`.
- Ahrefs returns **lowercase** country codes — normalize to uppercase to match `COUNTRY_MAP`.
- Batch keyword queries throttle with a ~300ms delay between calls; keep that rate-limit guard.
- `app/api/ai/chat/route.ts` has `maxDuration = 60`. There's also a streaming variant at
  `app/api/batch-stream/route.ts`.
