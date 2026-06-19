/**
 * App registry — the single source of truth (ARCHITECTURE.md §3).
 * Add an App = append one entry here + create content/apps/<slug>/docs/*.mdx
 * (and optionally changelog/*.mdx). Docs sidebar groups use Fumadocs meta.json
 * — also add `defineDocs` + loader entry in source.config.ts / lib/app-docs-source.ts.
 */

/** Optional marketing landing for an App's home (else a simple hero is shown).
    `features[].icon` uses lucide.dev kebab-case names (e.g. `bell-ring`). */
export interface AppLanding {
  headline?: string;
  subhead?: string;
  /** Hero download button; href falls back to `external.download`. */
  downloadCta?: { label: string; href?: string };
  /** Hero screenshot/image src; shows a placeholder when omitted. */
  screenshot?: string;
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

export interface AppConfig {
  /** URL segment, must match the content/apps/<slug>/ directory + subdomain. */
  slug: string;
  name: string;
  /** One-line description. */
  tagline: string;
  /** App icon src (e.g. `/apps/<slug>/icon.png`). */
  logo?: string;
  /** Optional: overrides the site blue for this App's subtree. */
  brandColor?: string;
  external?: {
    github?: string;
    download?: string;
    website?: string;
  };
  landing?: AppLanding;
}

export const apps: AppConfig[] = [
  {
    // 素材为占位，后续手动替换（截图、文案、下载链接）。
    slug: "whatermind",
    name: "WhaterMind",
    tagline: "认真喝水",
    logo: "/apps/whatermind/icon.png",
    brandColor: "#1970FA",
    external: { download: "#" },
    landing: {
      headline: "认真喝水 - 喝水记录提醒工具",
      subhead: "简洁、实用、专注，适配 iOS / iPadOS",
      downloadCta: { label: "下载 App", href: "#" },
      screenshot: "/apps/whatermind/hero.png", // TODO: 替换为真实截图
      featuresTitle: "功能介绍",
      features: [ 
        { icon: "droplets", title: "轻松记录", desc: "水、茶、咖啡等随心记录", },
        { icon: "sparkles", title: "智能目标", desc: "结合天气和活动量，规划饮水目标", }, 
        { icon: "bell-ring", title: "温和提醒", desc: "按你的习惯水提醒，不打扰", }, 
        { icon: "layout-dashboard", title: "小组件支持", desc: "不用打开 App，也能看饮水进度", }, 
        { icon: "chart-column-increasing", title: "趋势分析", desc: "按周、月、年查看统计变化，了解饮水状况", }, 
        { icon: "trophy", title: "喝水挑战", desc: "丰富有趣的挑战任务，培养喝水习惯", }, 
        { icon: "download", title: "数据导出", desc: "记录可导入，导出，数据有保障", }, 
        { icon: "refresh-cw", title: "多端同步", desc: " iPhone / iPad  同步使用", }, 
        { icon: "shield-check", title: "本地存储", desc: "记录保存在本地，隐私更安心", }, 
        { icon: "feather", title: "轻量小巧", desc: "原生开发，安装包不足 10MB，启动快，占用少", }, ],
      pricingTitle: "免费就能用，$4.99 买断。",
      pricingSubtitle: "日常使用完全免费 —— 普通用户永远无需付费",
      plans: [
        {
          name: "免费",
          price: "永久",
          items: [
            "不限制记录次数",
            "无限制创建饮品类型",
            "99.99% 的功能免费可用",
          ],
          cta: { label: "下载体验", href: "#" },
        },
        {
          name: "Pro",
          price: "$4.99",
          note: "一次性",
          featured: true,
          items: [
            "解锁全部挑战任务",
            "解锁多种水杯主题",
            "一次买断，永久使用",
          ],
          cta: { label: "升级 Pro", href: "#" },
        },
      ],
    },
  },
];
