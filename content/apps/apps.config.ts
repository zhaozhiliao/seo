/**
 * App registry — the single source of truth (ARCHITECTURE.md §3).
 * Add an App = append one entry here + create content/apps/<slug>/.
 * No route code changes required.
 */
export type AppNav = "docs" | "blog" | "changelog";

export interface AppConfig {
  /** URL segment, must match the content/apps/<slug>/ directory. */
  slug: string;
  name: string;
  /** One-line description. */
  tagline: string;
  /** Optional: overrides the site indigo for this App's subtree. */
  brandColor?: string;
  /** Which subpages are enabled. Others 404. */
  nav: AppNav[];
  external?: {
    github?: string;
    download?: string;
    website?: string;
  };
}

export const apps: AppConfig[] = [
  {
    slug: "app1",
    name: "App One",
    tagline: "一句话讲清楚这个 App 解决什么问题。",
    brandColor: "#4F46E5",
    nav: ["docs", "blog", "changelog"],
    external: { github: "https://github.com/wikipie/app-one" },
  },
];
