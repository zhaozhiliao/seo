import type { AppConfig } from "../app-types";

/** EchoKit */
export const echokit: AppConfig = {
  slug: "echokit",
  name: "EchoKit",
  tagline: "轻量实用的 iOS 工具",
  logo: "/apps/echokit/icon.png",
  brandColor: "#0049ff",
  landing: {
    theme: "split",
    headline: "EchoKit·回音",
    subhead: "面向开发者的轻量级反馈 SDK",
    downloadCta: { label: "暂不提供" },
    // heroCtas: [
    //   { href: "/docs", label: "文档" },
    //   { href: "/changelog", label: "更新日志" },
    // ],
    screenshot: ["/apps/echokit/hero1.png", "/apps/echokit/hero2.png"],
    features: [
      {
        icon: "message-square-text",
        title: "App 内反馈",
        desc: "用户无需离开 App，即可提交问题、建议和想法",
      },
      {
        icon: "fingerprint",
        title: "匿名追踪",
        desc: "无需登录，也能查看本机提交过的反馈进展",
      },
      {
        icon: "receipt-text",
        title: "反馈回执",
        desc: "每条反馈生成唯一 ID，方便后续查询和跟进",
      },
      {
        icon: "refresh-cw",
        title: "状态跟进",
        desc: "支持已收到、已查看、处理中、已回复等反馈状态",
      },
      {
        icon: "reply",
        title: "开发者回复",
        desc: "开发者可直接回复反馈，让用户知道处理结果",
      },
      {
        icon: "scan-text",
        title: "自动上下文",
        desc: "自动附带 App 版本、系统版本、设备型号和页面场景",
      },
      {
        icon: "route",
        title: "多渠道分发",
        desc: "反馈可同步到飞书、Slack、GitHub、邮箱或 Webhook",
      },
      {
        icon: "webhook",
        title: "开放集成",
        desc: "通过 Webhook 接入任意工作流或自有系统",
      },
      {
        icon: "code-xml",
        title: "轻量接入",
        desc: "面向 iOS 开发者设计，几行代码即可集成反馈能力",
      },
      {
        icon: "shield-check",
        title: "隐私可控",
        desc: "反馈字段、截图、联系方式和设备信息均可按需配置",
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
