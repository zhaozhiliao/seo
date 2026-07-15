import { Search, BadgeCheck, Link2, Code2, Languages, ListFilter } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Tool registry — single source of truth for the hub, the dynamic
    /tools/[slug] route, and the sitemap. The body for each slug is wired
    in app/tools/[slug]/tool-body.tsx. */
export interface ToolMeta {
  slug: string;
  icon: LucideIcon;
  name: string;
  nameEn: string;
  description: string;
  tags: string[];
}

export const TOOLS: ToolMeta[] = [
  {
    slug: "keywords",
    icon: Search,
    name: "关键词探索",
    nameEn: "Keyword Explorer",
    description:
      "查询全球各国搜索量、CPC 及竞争难度，支持单个关键词深度分析与批量导入多语言对比。",
    tags: ["Ahrefs", "批量查询", "多语言"],
  },
  {
    slug: "matching-terms",
    icon: ListFilter,
    name: "匹配关键词",
    nameEn: "Matching Terms",
    description:
      "按一个种子关键词和国家获取 Ahrefs 匹配词，控制返回数量并导出 CSV 或 Excel。",
    tags: ["Ahrefs", "关键词建议", "数据导出"],
  },
  {
    slug: "eeat",
    icon: BadgeCheck,
    name: "EEAT 评估",
    nameEn: "E-E-A-T Evaluator",
    description:
      "基于 Google 质量评估标准，从经验、专业性、权威性、可信度四个维度评估页面内容，给出评分与优化建议。",
    tags: ["AI", "内容质量", "可信度"],
  },
  {
    slug: "slug",
    icon: Link2,
    name: "Slug 生成器",
    nameEn: "Slug Generator",
    description: "输入任意语言的标题或关键词，AI 生成 SEO 友好的英文 URL Slug：全小写、连字符分隔、语义清晰。",
    tags: ["AI", "URL 优化", "多语言"],
  },
  {
    slug: "schema",
    icon: Code2,
    name: "Schema 生成器",
    nameEn: "Schema Builder",
    description: "可视化生成 Schema.org 结构化数据（JSON-LD），支持表单填写或用 AI 从描述自动生成。",
    tags: ["结构化数据", "JSON-LD", "AI"],
  },
  {
    slug: "ui-translate",
    icon: Languages,
    name: "UI 文案翻译",
    nameEn: "UI Copy Translator",
    description: "输入任意 UI 文案，一次翻译成多种语言，输出符合界面语境的地道表达，支持自定义提示词。",
    tags: ["AI", "本地化", "多语言"],
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
