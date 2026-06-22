/** Shared App config types — imported by each `content/apps/<slug>/app.config.ts`. */

/** Landing page layout theme — pick per App in `landing.theme`. */
export type AppLandingTheme =
  /** Vertical stack: hero → full-bleed screenshot → features → pricing. */
  | "stacked"
  /** Modular grid: hero + screenshot side-by-side on large screens. */
  | "split";

/** Shared link shape for footer columns and landing hero CTAs. */
export interface AppFooterLink {
  href: string;
  label: string;
  external?: boolean;
}

/** Optional marketing landing for an App's home (else a simple hero is shown).
    `features[].icon` uses lucide.dev kebab-case names (e.g. `bell-ring`).
    Hero secondary buttons: `heroCtas` (same link rules as footer). */
export interface AppLanding {
  /** Layout theme; defaults to `stacked`. */
  theme?: AppLandingTheme;
  headline?: string;
  subhead?: string;
  /** Hero download button; href falls back to `external.download`.
      Set `disabled: true` or omit href/download URL for a non-interactive state. */
  downloadCta?: { label: string; href?: string; disabled?: boolean };
  /** Outline buttons after download — configured per App. */
  heroCtas?: AppFooterLink[];
  /** Hero screenshot/image src, or array for carousel. Shows placeholder when omitted. */
  screenshot?: string | string[];
  featuresTitle?: string;
  features?: { icon?: string; title: string; desc: string }[];
  pricingTitle?: string;
  pricingSubtitle?: string;
  plans?: {
    name: string;
    price: string;
    note?: string;
    items: string[];
    cta?: { label: string; href: string };
    featured?: boolean;
  }[];
}

/** App site footer — read verbatim by `AppSiteFooter`.
    Internal links are root-relative (`/docs`). Cross-site: `external: true` or full URL.
    Use `@wikipie` for the personal site root (resolved at runtime). */
export interface AppFooterColumn {
  title: string;
  links: AppFooterLink[];
}

export interface AppFooterConfig {
  columns: AppFooterColumn[];
  /** Copyright line entity; defaults to `name`. */
  copyrightName?: string;
}

export interface AppConfig {
  /** URL segment — must match this directory name + subdomain. */
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  brandColor?: string;
  external?: {
    github?: string;
    download?: string;
    website?: string;
  };
  landing?: AppLanding;
  footer: AppFooterConfig;
}
