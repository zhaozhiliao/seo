# Modular Grid — Reference

Corpus: Josef Müller-Brockmann, *Grid Systems in Graphic Design* (1981). Engineering patterns from [hyperagent-public-skills](https://github.com/alexmcdonnell-airtable/hyperagent-public-skills/blob/main/skill-muller-brockmann-grid-systems.json), adapted for **Wikipie (ahrefs-next)** Geist stack.

> **Box-on-grid ≠ ink-on-grid.** Large display type needs optical alignment (§ 2.6).

---

## PART 1 — Discipline (structure only; visuals stay Geist)

- **Modular grid**: columns + rows + gutters + margins; elements occupy whole modules.
- **Web default**: 12 columns + 8px baseline (`--space-2`); leading 24px (`--space-6`).
- **Vertical rhythm**: all spacing / line-heights / media heights = baseline multiples.
- **Placement**: by column **line** (e.g. `1 / 7`), not eyeballed percentages.
- **Asymmetry OK** when held by grid lines.

Do **not** impose Swiss red / Helvetica-only palette — this project uses Geist tokens.

---

## PART 2 — Engineering

### 2.1 One source of truth

All grid params in `:root`. Content and overlay read the **same** variables. See `scripts/grid-tokens.css`.

### 2.2 Overlay in the SAME content box ← #1 bug

Failure: content in centered `max-width` container; overlay is full-width sibling → columns drift on wide viewports.

Fix: `.guides` **inside** the same `Container` / `.wrap`. Column guides use `left/right: var(--grid-margin)` + `repeat(var(--grid-cols), 1fr)` + `column-gap: var(--grid-gutter)`.

### 2.3 Subgrid bands

```css
.grid-page {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  column-gap: var(--grid-gutter);
  row-gap: var(--grid-lh);
}
.grid-band {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  column-gap: var(--grid-gutter);
  row-gap: var(--grid-lh);
  align-items: start;
}
@supports not (grid-template-columns: subgrid) {
  .grid-band { grid-template-columns: repeat(var(--grid-cols), 1fr); }
}
```

Children: `grid-column: <start> / <end>` (1-based lines; line 13 = right edge of 12 cols).

### 2.4 Baseline lock

- `--grid-lh` = 3 × `--grid-bl` (24px default).
- Display type: `line-height` in **px**, not unitless.
- Section padding: multiples of `--grid-bl` (prefer `--space-*` tokens).
- Image heights: multiples of `--grid-lh` so top and bottom land on lines.

### 2.5 Dev overlay toggle

- Button + **`G` key** → `body.grid-on`.
- Draws numbered columns, major/minor baseline, margin lines.
- **Dev-only** unless user requests production toggle.

### 2.6 Optical alignment ← #2 bug

Letterform **ink** is inset by left side-bearing. Measure first glyph with canvas `actualBoundingBoxLeft`; set `marginLeft` so ink hits the column line. Use `scripts/optical-align.ts`.

**Caveat**: font-specific. Must run after `document.fonts.ready` and on resize. Headless verify needs embedded webfont.

---

## Tokens (add to `app/globals.css`)

Map to existing Geist scale:

| Grid var | Default | Geist equivalent |
|----------|---------|------------------|
| `--grid-cols` | 12 | — |
| `--grid-bl` | 8px | `--space-2` |
| `--grid-lh` | 24px | `--space-6` |
| `--grid-gutter` | 24px | `--space-6` |
| `--grid-margin` | 24px | `Container` `px-6` |
| `--grid-maxw` | 1440px | `--page-max` |
| `--grid-content-max` | 800px | `--content-max` |

Full CSS block: [scripts/grid-tokens.css](./scripts/grid-tokens.css).

---

## Verify (layout PRs)

At viewports **1440, 1180, 900** (above and below max-width):

1. **Column adherence** — `.grid-band > *` left → column start, right → column end (~0px). Exclude optically-aligned display selectors.
2. **Overlay match** — `.guides .col` rects = content column rects.
3. **Baseline** — text tops mod `--grid-bl` ≈ 0 (tolerance ≈ half baseline).
4. **Optical ink** — display elements' ink-left = their column line.

Pass: `col=0px overlay=0px baseline≤4px ink=0px`.

Upstream Puppeteer harness: hyperagent `verify_grid.js` (optional; requires `CHROME` + `puppeteer-core`).

---

## Site audit (Wikipie)

Audit date: 2026-06. **No layout changes made** — structure notes only.

### Shared layout primitives

| Primitive | Location | Grid status |
|-----------|----------|-------------|
| `Container` | `components/ui/container.tsx` | `max-width` + `px-6`; **no column grid** |
| `--page-max` / `--content-max` | `app/globals.css` | Width caps only |
| `--space-*` | `app/globals.css` | 4px scale; `--space-2`=8px usable as baseline |
| Card grids | multiple pages | `sm:grid-cols-2 lg:grid-cols-3` — responsive, not line-aligned across sections |

### Page-by-page

| Route | Component | Layout pattern | Modular grid? | Notes |
|-------|-----------|----------------|---------------|-------|
| `/` | `app/(site)/page.tsx` | `Container` + stacked sections + 3-col app cards | No | Hero uses `leading-[1.1]` (off 8px rhythm). OK for Geist marketing. |
| `/blog`, `/blog/[slug]` | blog pages | `Container` + list / prose | No | Reading width; `--content-max` appropriate. |
| `/docs/*` | `app/(site)/docs/layout.tsx` | `220px` sidebar + main | Functional 2-col | Not 12-col; don't force modular grid on docs. |
| `/tools`, `/tools/[slug]` | tools pages + `ToolShell` | `Container` + cards / forms | No | Tool UI; grid discipline low priority. |
| `/apps` | `app/apps/page.tsx` | `Container` + card grid | No | Same as home apps section. |
| `/settings` | `settings/page.tsx` | `ToolShell` | No | Form layout. |
| App `/` (subdomain) | `components/app/app-landing.tsx` | `Container width="content"` single column | **Candidate** | Hero + full-bleed screenshot (`-mx-6`) + feature list + 2-col pricing. Best future target for subgrid bands **without** changing Geist visuals. |
| App `/docs/*` | `app/apps/[app]/docs/layout.tsx` | Same as personal docs | Functional 2-col | Keep as-is. |
| App `/changelog` | changelog page | `Container` + timeline | No | Timeline layout. |

### Recommendations (when user asks to refactor layout)

1. **Start with App landing** only — introduce `.grid-page` inside existing `Container`; map hero to cols 1–6, screenshot 6–13, etc.; keep current classes/colors.
2. **Leave docs/tools/blog** on reading + sidebar patterns.
3. **Add dev grid overlay** behind `process.env.NODE_ENV === 'development'` before any landing refactor.
4. **Do not** replace Geist `--brand` or card styling with Swiss editorial palette.

---

## Creed

A grid you can't toggle on and measure is a mood board. One source of truth, prove at 0px, align the **ink** — but keep Wikipie looking like Wikipie.
