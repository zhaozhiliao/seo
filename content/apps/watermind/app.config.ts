import type { AppConfig } from "../app-types";

const APP_STORE = "https://apps.apple.com/cn/app/id6779088281";

/** WaterMind — 认真喝水 */
export const watermind: AppConfig = {
  slug: "watermind",
  name: "WaterMind",
  tagline: "认真喝水",
  logo: "/apps/watermind/icon.png",
  brandColor: "#1970FA",
  external: { download: APP_STORE },
  landing: {
    theme: "stacked",
    headline: "认真喝水 - 喝水记录提醒工具",
    subhead: "简洁、实用、专注，适配 iOS / iPadOS",
    downloadCta: { label: "下载 App" },
    heroCtas: [{ href: "/changelog", label: "更新日志" }],
    screenshot: "/apps/watermind/hero.png",
    featuresTitle: "功能介绍",
    features: [
      { icon: "droplets", title: "轻松记录", desc: "水、茶、咖啡等随心记录" },
      { icon: "sparkles", title: "智能目标", desc: "结合天气和活动量，规划饮水目标" },
      { icon: "bell-ring", title: "温和提醒", desc: "按你的习惯水提醒，不打扰" },
      { icon: "layout-dashboard", title: "小组件支持", desc: "不用打开 App，也能看饮水进度" },
      { icon: "chart-column-increasing", title: "趋势分析", desc: "按周、月、年查看统计变化，了解饮水状况" },
      { icon: "trophy", title: "喝水挑战", desc: "丰富有趣的挑战任务，培养喝水习惯" },
      { icon: "download", title: "数据导出", desc: "记录可导入，导出，数据有保障" },
      { icon: "refresh-cw", title: "多端同步", desc: " iPhone / iPad  同步使用" },
      { icon: "shield-check", title: "本地存储", desc: "记录保存在本地，隐私更安心" },
      { icon: "feather", title: "轻量小巧", desc: "原生开发，安装包约 4MB，启动快，占用少" },
    ],
    pricingTitle: "免费就能用",
    pricingSubtitle: "日常使用完全免费 —— 普通用户永远无需付费",
    plans: [
      {
        name: "免费",
        price: "永久",
        items: ["不限制记录次数", "无限制创建饮品类型", "99.99% 的功能免费可用"],
        cta: { label: "下载体验", href: APP_STORE },
      },
      {
        name: "Pro",
        price: "暂不提供",
        note: "一次性",
        featured: true,
        items: ["解锁全部挑战任务", "解锁多种水杯主题", "一次买断，永久使用"],
        cta: { label: "升级 Pro", href: APP_STORE },
      },
    ],
  },
  footer: {
    columns: [
      {
        title: "App",
        links: [
          { href: "/", label: "介绍" },
          { href: "/docs", label: "文档" },
          { href: "/changelog", label: "更新日志" },
          { href: APP_STORE, label: "下载", external: true },
        ],
      },
      {
        title: "Legal",
        links: [
          { href: "/docs/privacy", label: "隐私政策" },
          { href: "/docs/terms", label: "服务条款" },
          { href: "/docs/support", label: "支持" },
        ],
      },
      {
        title: "Site",
        links: [{ href: "@wikipie", label: "wikipie" }],
      },
    ],
  },
};
