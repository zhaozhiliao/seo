---
name: modular-grid
description: >-
  Applies verifiable modular grid engineering (Müller-Brockmann discipline adapted
  for Wikipie/Geist) — CSS-variable source of truth, subgrid bands, baseline rhythm,
  overlay-in-same-container, optical ink alignment. Use when refactoring page layout
  structure, adding editorial spreads, fixing column misalignment, or implementing a
  dev grid overlay (G key). Does NOT change Geist colors, typography, or visual style.
---

# Modular Grid (Wikipie / Geist)

Grid is **load-bearing structure**, not decoration. Adapted from [Hyperagent Müller-Brockmann skill](https://github.com/alexmcdonnell-airtable/hyperagent-public-skills/blob/main/skill-muller-brockmann-grid-systems.json) for this repo's **Geist design system** — keep existing tokens (`--brand`, `--fg`, `Container`, semantic utilities). See [reference.md](./reference.md) for full engineering rules and site audit.

## Wikipie constraints (non-negotiable)

- **No visual-style changes** unless the user explicitly asks (palette, fonts, radii, shadows stay Geist).
- **No hard-coded hex** in components — grid vars live in `app/globals.css` alongside existing tokens.
- **Baseline unit**: `--space-2` (8px). Leading default: `--space-6` (24px = 3× baseline).
- **Width source of truth**: `--page-max` (1440px), `--content-max` (800px), `Container` (`components/ui/container.tsx`).
- **Default web grid**: 12 columns inside `Container`; docs/tools use functional 2-col (sidebar + main), not full 12-col spreads.

## When to apply

| Apply | Skip |
|-------|------|
| App marketing landing refactors (`components/app/app-landing.tsx`) | Docs/blog prose (`.prose`, `--content-max`) |
| New editorial / report / magazine pages | Tool UI (`components/tools/*`) |
| Cross-section column alignment bugs | Card listing grids (`sm:grid-cols-2 lg:grid-cols-3`) — responsive is enough |
| User asks for grid overlay / "align to grid" | Settings, API forms |

## Implementation checklist

1. **Add grid tokens** to `:root` in `globals.css` (see reference § Tokens) — `--grid-cols`, `--grid-gutter`, `--grid-margin`, `--grid-bl`, `--grid-lh`. Gutter/margin must be multiples of `--grid-bl`.
2. **One box**: overlay `.guides` lives **inside** the same `Container` (or `.wrap`) as content — never a full-width sibling of a centered max-width container.
3. **Subgrid bands**: each horizontal section = `.grid-band` spanning all columns + `grid-template-columns: subgrid`; children use explicit column lines (`grid-column: 1 / 7`).
4. **Baseline lock**: display `line-height` in **px multiples** of `--grid-bl`; section padding/margins use `--space-*`; media heights = multiples of `--grid-lh`.
5. **Optical alignment**: large headings — run `scripts/optical-align.ts` after fonts load (ink on line, not box). See reference § 2.6.
6. **Dev overlay** (optional): `G` toggles `body.grid-on`; overlay reads same CSS vars. Dev-only — do not ship visible grid to production unless requested.
7. **Verify** at widths 1440 / 1180 / 900: `CHROME=… PUP=… npm run verify:grid -- http://watermind.localhost:3001`

## Tailwind / React patterns

```tsx
// Band inside Container — column placement via inline style or utility
<div className="grid-band" style={{ gridColumn: "1 / -1" }}>
  <h1 className="display-headline" style={{ gridColumn: "1 / 8" }}>...</h1>
  <figure style={{ gridColumn: "8 / 13" }}>...</figure>
</div>
```

Add `.grid-band` + parent `.grid-page` in `globals.css` (reference § CSS scaffold). Prefer extending `Container` with an optional `grid` prop over duplicating max-width logic.

## Common failure modes

1. **Overlay misaligned** — overlay outside centered container; fix: nest `.guides` inside `Container`.
2. **Headline "off grid"** — box aligned but glyph side-bearing shifts ink; fix: optical-align script.
3. **Baseline drift** — unitless `line-height` on large type; fix: px multiples of 8.
4. **Breaking Geist** — swapping palette to Swiss red / removing `--brand`; fix: grid vars only, no token overrides.

## Scripts

| File | Purpose |
|------|---------|
| `lib/optical-align.ts` | Client util: nudge `.display-headline` ink onto column line |
| `components/app/grid-dev-overlay.tsx` | Dev-only overlay toggle (`G` key) on App landing |
| `scripts/verify-grid.mjs` | Puppeteer harness — `npm run verify:grid` (needs `CHROME` + `PUP`) |
| [scripts/grid-tokens.css](./scripts/grid-tokens.css) | Reference CSS snippet (canonical copy in `app/globals.css`) |

## Site audit

Current pages use `Container` + ad-hoc responsive grids — **no modular 12-col system yet**. Full page-by-page notes: [reference.md § Site audit](./reference.md#site-audit-wikipie).

When refactoring a page, read the audit row for that route first; do not rewrite pages the user did not ask to change.
