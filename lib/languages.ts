export interface LangConfig {
  name: string;       // 中文名
  nativeName: string; // 原生语言名
  rtl?: boolean;
  badge: string;
  color: string;
}

export const LANG_MAP: Record<string, LangConfig> = {
  en: { name: "英语",         nativeName: "English",            badge: "bg-blue-50 text-blue-600 border-blue-100",       color: "text-blue-500" },
  fr: { name: "法语",         nativeName: "Français",           badge: "bg-purple-50 text-purple-600 border-purple-100", color: "text-purple-500" },
  ar: { name: "阿拉伯语",     nativeName: "العربية", rtl: true, badge: "bg-orange-50 text-orange-600 border-orange-100", color: "text-orange-500" },
  ru: { name: "俄语",         nativeName: "Русский",            badge: "bg-red-50 text-red-600 border-red-100",          color: "text-red-500" },
  es: { name: "西班牙语",     nativeName: "Español",            badge: "bg-emerald-50 text-emerald-600 border-emerald-100", color: "text-emerald-600" },
  de: { name: "德语",         nativeName: "Deutsch",            badge: "bg-yellow-50 text-yellow-700 border-yellow-100", color: "text-yellow-600" },
  pt: { name: "葡萄牙语",     nativeName: "Português",          badge: "bg-lime-50 text-lime-700 border-lime-100",       color: "text-lime-600" },
  it: { name: "意大利语",     nativeName: "Italiano",           badge: "bg-green-50 text-green-700 border-green-100",    color: "text-green-600" },
  ja: { name: "日语",         nativeName: "日本語",              badge: "bg-pink-50 text-pink-600 border-pink-100",       color: "text-pink-500" },
  ko: { name: "韩语",         nativeName: "한국어",              badge: "bg-rose-50 text-rose-600 border-rose-100",       color: "text-rose-500" },
  tr: { name: "土耳其语",     nativeName: "Türkçe",             badge: "bg-cyan-50 text-cyan-600 border-cyan-100",       color: "text-cyan-600" },
  nl: { name: "荷兰语",       nativeName: "Nederlands",         badge: "bg-teal-50 text-teal-600 border-teal-100",       color: "text-teal-600" },
  pl: { name: "波兰语",       nativeName: "Polski",             badge: "bg-indigo-50 text-indigo-600 border-indigo-100", color: "text-indigo-600" },
  hi: { name: "印地语",       nativeName: "हिन्दी",               badge: "bg-amber-50 text-amber-700 border-amber-100",    color: "text-amber-600" },
  id: { name: "印度尼西亚语", nativeName: "Bahasa Indonesia",   badge: "bg-sky-50 text-sky-600 border-sky-100",          color: "text-sky-600" },
  vi: { name: "越南语",       nativeName: "Tiếng Việt",         badge: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100", color: "text-fuchsia-500" },
  th: { name: "泰语",         nativeName: "ภาษาไทย",            badge: "bg-violet-50 text-violet-600 border-violet-100", color: "text-violet-500" },
  sv: { name: "瑞典语",       nativeName: "Svenska",            badge: "bg-blue-50 text-blue-700 border-blue-200",       color: "text-blue-700" },
  uk: { name: "乌克兰语",     nativeName: "Українська",         badge: "bg-yellow-50 text-yellow-600 border-yellow-200", color: "text-yellow-500" },
  cs: { name: "捷克语",       nativeName: "Čeština",            badge: "bg-slate-50 text-slate-600 border-slate-200",    color: "text-slate-500" },
  he: { name: "希伯来语",     nativeName: "עברית", rtl: true,   badge: "bg-blue-50 text-blue-800 border-blue-200",       color: "text-blue-800" },
  fa: { name: "波斯语",       nativeName: "فارسی", rtl: true,   badge: "bg-purple-50 text-purple-800 border-purple-200", color: "text-purple-800" },
  ro: { name: "罗马尼亚语",   nativeName: "Română",             badge: "bg-orange-50 text-orange-700 border-orange-200", color: "text-orange-700" },
  hu: { name: "匈牙利语",     nativeName: "Magyar",             badge: "bg-red-50 text-red-700 border-red-200",          color: "text-red-700" },
  el: { name: "希腊语",       nativeName: "Ελληνικά",           badge: "bg-cyan-50 text-cyan-800 border-cyan-200",       color: "text-cyan-800" },

  // ── 二手车外链 / SEO 优先补充语言 ──
  // P0/P1
  uz: { name: "乌兹别克语",   nativeName: "Oʻzbek",             badge: "bg-blue-50 text-blue-600 border-blue-100",       color: "text-blue-500" },
  kk: { name: "哈萨克语",     nativeName: "Қазақша",            badge: "bg-teal-50 text-teal-600 border-teal-100",       color: "text-teal-600" },
  ka: { name: "格鲁吉亚语",   nativeName: "ქართული",            badge: "bg-red-50 text-red-600 border-red-100",          color: "text-red-500" },
  ky: { name: "吉尔吉斯语",   nativeName: "Кыргызча",           badge: "bg-rose-50 text-rose-600 border-rose-100",       color: "text-rose-500" },
  az: { name: "阿塞拜疆语",   nativeName: "Azərbaycan",         badge: "bg-cyan-50 text-cyan-600 border-cyan-100",       color: "text-cyan-600" },
  hy: { name: "亚美尼亚语",   nativeName: "Հայերեն",            badge: "bg-orange-50 text-orange-600 border-orange-100", color: "text-orange-500" },
  // P1
  bg: { name: "保加利亚语",   nativeName: "Български",           badge: "bg-green-50 text-green-700 border-green-100",    color: "text-green-600" },
  sr: { name: "塞尔维亚语",   nativeName: "Српски",             badge: "bg-indigo-50 text-indigo-600 border-indigo-100", color: "text-indigo-600" },
  sq: { name: "阿尔巴尼亚语", nativeName: "Shqip",              badge: "bg-red-50 text-red-700 border-red-200",          color: "text-red-700" },
  am: { name: "阿姆哈拉语",   nativeName: "አማርኛ",              badge: "bg-amber-50 text-amber-700 border-amber-100",    color: "text-amber-600" },
  rw: { name: "卢旺达语",     nativeName: "Kinyarwanda",        badge: "bg-lime-50 text-lime-700 border-lime-100",       color: "text-lime-600" },
  // P2
  sk: { name: "斯洛伐克语",   nativeName: "Slovenčina",         badge: "bg-slate-50 text-slate-600 border-slate-200",    color: "text-slate-500" },
  hr: { name: "克罗地亚语",   nativeName: "Hrvatski",           badge: "bg-blue-50 text-blue-700 border-blue-200",       color: "text-blue-700" },
  bs: { name: "波斯尼亚语",   nativeName: "Bosanski",           badge: "bg-violet-50 text-violet-600 border-violet-100", color: "text-violet-500" },
  lt: { name: "立陶宛语",     nativeName: "Lietuvių",           badge: "bg-yellow-50 text-yellow-700 border-yellow-100", color: "text-yellow-600" },
  lv: { name: "拉脱维亚语",   nativeName: "Latviešu",           badge: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100", color: "text-fuchsia-500" },
  et: { name: "爱沙尼亚语",   nativeName: "Eesti",              badge: "bg-sky-50 text-sky-600 border-sky-100",          color: "text-sky-600" },
  mn: { name: "蒙古语",       nativeName: "Монгол",             badge: "bg-purple-50 text-purple-600 border-purple-100", color: "text-purple-500" },
  tg: { name: "塔吉克语",     nativeName: "Тоҷикӣ",             badge: "bg-pink-50 text-pink-600 border-pink-100",       color: "text-pink-500" },
  // 可暂缓
  no: { name: "挪威语",       nativeName: "Norsk",              badge: "bg-red-50 text-red-600 border-red-100",          color: "text-red-500" },
  da: { name: "丹麦语",       nativeName: "Dansk",              badge: "bg-rose-50 text-rose-600 border-rose-100",       color: "text-rose-500" },
  fi: { name: "芬兰语",       nativeName: "Suomi",              badge: "bg-blue-50 text-blue-600 border-blue-100",       color: "text-blue-500" },
  is: { name: "冰岛语",       nativeName: "Íslenska",           badge: "bg-cyan-50 text-cyan-700 border-cyan-200",       color: "text-cyan-700" },
  lb: { name: "卢森堡语",     nativeName: "Lëtzebuergesch",     badge: "bg-teal-50 text-teal-700 border-teal-200",       color: "text-teal-700" },
  mt: { name: "马耳他语",     nativeName: "Malti",              badge: "bg-orange-50 text-orange-700 border-orange-200", color: "text-orange-700" },
  mg: { name: "马达加斯加语", nativeName: "Malagasy",           badge: "bg-emerald-50 text-emerald-600 border-emerald-100", color: "text-emerald-600" },
  cnr:{ name: "黑山语",       nativeName: "Crnogorski",         badge: "bg-slate-50 text-slate-700 border-slate-200",    color: "text-slate-600" },
};

export const DEFAULT_LANGS = ["en", "fr", "ar", "ru", "es"];

export const ALL_LANGS = Object.keys(LANG_MAP);
