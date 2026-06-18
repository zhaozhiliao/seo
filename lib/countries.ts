// Lang is an open string (not limited to any fixed set)
export type Lang = string;

export interface CountryConfig {
  name: string;
  lang: Lang;
  continent: string;
}

export const COUNTRY_MAP: Record<string, CountryConfig> = {
  // ── 北美洲 ──────────────────────────────────────────────────────────
  US: { name: "美国",           lang: "en", continent: "北美洲" },
  CA: { name: "加拿大",         lang: "en", continent: "北美洲" },
  MX: { name: "墨西哥",         lang: "es", continent: "北美洲" },
  GT: { name: "危地马拉",       lang: "es", continent: "北美洲" },
  HN: { name: "洪都拉斯",       lang: "es", continent: "北美洲" },
  SV: { name: "萨尔瓦多",       lang: "es", continent: "北美洲" },
  NI: { name: "尼加拉瓜",       lang: "es", continent: "北美洲" },
  CR: { name: "哥斯达黎加",     lang: "es", continent: "北美洲" },
  PA: { name: "巴拿马",         lang: "es", continent: "北美洲" },
  CU: { name: "古巴",           lang: "es", continent: "北美洲" },
  DO: { name: "多米尼加",       lang: "es", continent: "北美洲" },
  PR: { name: "波多黎各",       lang: "es", continent: "北美洲" },
  JM: { name: "牙买加",         lang: "en", continent: "北美洲" },
  TT: { name: "特立尼达和多巴哥", lang: "en", continent: "北美洲" },

  // ── 南美洲 ──────────────────────────────────────────────────────────
  BR: { name: "巴西",           lang: "pt", continent: "南美洲" },
  AR: { name: "阿根廷",         lang: "es", continent: "南美洲" },
  CO: { name: "哥伦比亚",       lang: "es", continent: "南美洲" },
  CL: { name: "智利",           lang: "es", continent: "南美洲" },
  PE: { name: "秘鲁",           lang: "es", continent: "南美洲" },
  VE: { name: "委内瑞拉",       lang: "es", continent: "南美洲" },
  EC: { name: "厄瓜多尔",       lang: "es", continent: "南美洲" },
  BO: { name: "玻利维亚",       lang: "es", continent: "南美洲" },
  PY: { name: "巴拉圭",         lang: "es", continent: "南美洲" },
  UY: { name: "乌拉圭",         lang: "es", continent: "南美洲" },

  // ── 欧洲 ────────────────────────────────────────────────────────────
  GB: { name: "英国",           lang: "en", continent: "欧洲" },
  DE: { name: "德国",           lang: "de", continent: "欧洲" },
  FR: { name: "法国",           lang: "fr", continent: "欧洲" },
  IT: { name: "意大利",         lang: "it", continent: "欧洲" },
  ES: { name: "西班牙",         lang: "es", continent: "欧洲" },
  NL: { name: "荷兰",           lang: "nl", continent: "欧洲" },
  BE: { name: "比利时",         lang: "fr", continent: "欧洲" },
  CH: { name: "瑞士",           lang: "de", continent: "欧洲" },
  AT: { name: "奥地利",         lang: "de", continent: "欧洲" },
  SE: { name: "瑞典",           lang: "sv", continent: "欧洲" },
  NO: { name: "挪威",           lang: "en", continent: "欧洲" },
  DK: { name: "丹麦",           lang: "en", continent: "欧洲" },
  FI: { name: "芬兰",           lang: "en", continent: "欧洲" },
  PL: { name: "波兰",           lang: "pl", continent: "欧洲" },
  PT: { name: "葡萄牙",         lang: "pt", continent: "欧洲" },
  RU: { name: "俄罗斯",         lang: "ru", continent: "欧洲" },
  TR: { name: "土耳其",         lang: "tr", continent: "欧洲" },
  CZ: { name: "捷克",           lang: "cs", continent: "欧洲" },
  RO: { name: "罗马尼亚",       lang: "ro", continent: "欧洲" },
  HU: { name: "匈牙利",         lang: "hu", continent: "欧洲" },
  GR: { name: "希腊",           lang: "el", continent: "欧洲" },
  UA: { name: "乌克兰",         lang: "uk", continent: "欧洲" },
  BY: { name: "白俄罗斯",       lang: "ru", continent: "欧洲" },
  SK: { name: "斯洛伐克",       lang: "cs", continent: "欧洲" },
  BG: { name: "保加利亚",       lang: "en", continent: "欧洲" },
  HR: { name: "克罗地亚",       lang: "en", continent: "欧洲" },
  RS: { name: "塞尔维亚",       lang: "en", continent: "欧洲" },
  BA: { name: "波斯尼亚",       lang: "en", continent: "欧洲" },
  ME: { name: "黑山",           lang: "en", continent: "欧洲" },
  MK: { name: "北马其顿",       lang: "en", continent: "欧洲" },
  AL: { name: "阿尔巴尼亚",     lang: "en", continent: "欧洲" },
  MD: { name: "摩尔多瓦",       lang: "ro", continent: "欧洲" },
  GE: { name: "格鲁吉亚",       lang: "ru", continent: "欧洲" },
  AZ: { name: "阿塞拜疆",       lang: "ru", continent: "欧洲" },
  AM: { name: "亚美尼亚",       lang: "ru", continent: "欧洲" },
  LT: { name: "立陶宛",         lang: "en", continent: "欧洲" },
  LV: { name: "拉脱维亚",       lang: "en", continent: "欧洲" },
  EE: { name: "爱沙尼亚",       lang: "en", continent: "欧洲" },
  SI: { name: "斯洛文尼亚",     lang: "en", continent: "欧洲" },
  IE: { name: "爱尔兰",         lang: "en", continent: "欧洲" },
  IS: { name: "冰岛",           lang: "en", continent: "欧洲" },
  LU: { name: "卢森堡",         lang: "fr", continent: "欧洲" },
  MT: { name: "马耳他",         lang: "en", continent: "欧洲" },
  CY: { name: "塞浦路斯",       lang: "el", continent: "欧洲" },

  // ── 亚洲 ────────────────────────────────────────────────────────────
  JP: { name: "日本",           lang: "ja", continent: "亚洲" },
  KR: { name: "韩国",           lang: "ko", continent: "亚洲" },
  IN: { name: "印度",           lang: "hi", continent: "亚洲" },
  CN: { name: "中国大陆",       lang: "en", continent: "亚洲" },
  SG: { name: "新加坡",         lang: "en", continent: "亚洲" },
  TH: { name: "泰国",           lang: "th", continent: "亚洲" },
  ID: { name: "印度尼西亚",     lang: "id", continent: "亚洲" },
  MY: { name: "马来西亚",       lang: "en", continent: "亚洲" },
  PH: { name: "菲律宾",         lang: "en", continent: "亚洲" },
  VN: { name: "越南",           lang: "vi", continent: "亚洲" },
  PK: { name: "巴基斯坦",       lang: "en", continent: "亚洲" },
  BD: { name: "孟加拉国",       lang: "en", continent: "亚洲" },
  NP: { name: "尼泊尔",         lang: "en", continent: "亚洲" },
  LK: { name: "斯里兰卡",       lang: "en", continent: "亚洲" },
  MM: { name: "缅甸",           lang: "en", continent: "亚洲" },
  KH: { name: "柬埔寨",         lang: "en", continent: "亚洲" },
  MN: { name: "蒙古",           lang: "en", continent: "亚洲" },
  IL: { name: "以色列",         lang: "he", continent: "亚洲" },
  AE: { name: "阿联酋",         lang: "ar", continent: "亚洲" },
  SA: { name: "沙特阿拉伯",     lang: "ar", continent: "亚洲" },
  KW: { name: "科威特",         lang: "ar", continent: "亚洲" },
  QA: { name: "卡塔尔",         lang: "ar", continent: "亚洲" },
  BH: { name: "巴林",           lang: "ar", continent: "亚洲" },
  OM: { name: "阿曼",           lang: "ar", continent: "亚洲" },
  JO: { name: "约旦",           lang: "ar", continent: "亚洲" },
  LB: { name: "黎巴嫩",         lang: "ar", continent: "亚洲" },
  IQ: { name: "伊拉克",         lang: "ar", continent: "亚洲" },
  YE: { name: "也门",           lang: "ar", continent: "亚洲" },
  SY: { name: "叙利亚",         lang: "ar", continent: "亚洲" },
  PS: { name: "巴勒斯坦",       lang: "ar", continent: "亚洲" },
  IR: { name: "伊朗",           lang: "fa", continent: "亚洲" },
  AF: { name: "阿富汗",         lang: "fa", continent: "亚洲" },
  KZ: { name: "哈萨克斯坦",     lang: "ru", continent: "亚洲" },
  UZ: { name: "乌兹别克斯坦",   lang: "ru", continent: "亚洲" },
  TM: { name: "土库曼斯坦",     lang: "ru", continent: "亚洲" },
  TJ: { name: "塔吉克斯坦",     lang: "ru", continent: "亚洲" },
  KG: { name: "吉尔吉斯斯坦",   lang: "ru", continent: "亚洲" },

  // ── 非洲 ────────────────────────────────────────────────────────────
  NG: { name: "尼日利亚",       lang: "en", continent: "非洲" },
  ZA: { name: "南非",           lang: "en", continent: "非洲" },
  KE: { name: "肯尼亚",         lang: "en", continent: "非洲" },
  GH: { name: "加纳",           lang: "en", continent: "非洲" },
  ET: { name: "埃塞俄比亚",     lang: "en", continent: "非洲" },
  TZ: { name: "坦桑尼亚",       lang: "en", continent: "非洲" },
  UG: { name: "乌干达",         lang: "en", continent: "非洲" },
  ZW: { name: "津巴布韦",       lang: "en", continent: "非洲" },
  ZM: { name: "赞比亚",         lang: "en", continent: "非洲" },
  RW: { name: "卢旺达",         lang: "en", continent: "非洲" },
  EG: { name: "埃及",           lang: "ar", continent: "非洲" },
  DZ: { name: "阿尔及利亚",     lang: "ar", continent: "非洲" },
  MA: { name: "摩洛哥",         lang: "ar", continent: "非洲" },
  TN: { name: "突尼斯",         lang: "ar", continent: "非洲" },
  LY: { name: "利比亚",         lang: "ar", continent: "非洲" },
  SD: { name: "苏丹",           lang: "ar", continent: "非洲" },
  SN: { name: "塞内加尔",       lang: "fr", continent: "非洲" },
  CI: { name: "科特迪瓦",       lang: "fr", continent: "非洲" },
  CM: { name: "喀麦隆",         lang: "fr", continent: "非洲" },
  MG: { name: "马达加斯加",     lang: "fr", continent: "非洲" },
  AO: { name: "安哥拉",         lang: "pt", continent: "非洲" },
  MZ: { name: "莫桑比克",       lang: "pt", continent: "非洲" },

  // ── 大洋洲 ──────────────────────────────────────────────────────────
  AU: { name: "澳大利亚",       lang: "en", continent: "大洋洲" },
  NZ: { name: "新西兰",         lang: "en", continent: "大洋洲" },
};

export const CONTINENTS = ["北美洲", "南美洲", "欧洲", "亚洲", "非洲", "大洋洲"];

export const COUNTRIES_BY_CONTINENT: Record<string, string[]> = {};
for (const [code, cfg] of Object.entries(COUNTRY_MAP)) {
  if (!COUNTRIES_BY_CONTINENT[cfg.continent]) {
    COUNTRIES_BY_CONTINENT[cfg.continent] = [];
  }
  COUNTRIES_BY_CONTINENT[cfg.continent].push(code);
}

// ── 批量查询默认展示国家（可在此处修改） ────────────────────────────────
export const DEFAULT_COUNTRIES = [
  "RU", "US", "GH", "BY", "NL", "DZ", "NG", "GB",
  "DE", "GE", "FR", "PL", "CA", "KG", "KZ", "AM",
  "UZ", "ZA", "SA", "AZ", "ES", "TJ", "CI", "RO",
];

export const ALL_COUNTRY_CODES = Object.keys(COUNTRY_MAP);
