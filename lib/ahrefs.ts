const BASE_URL = "https://api.ahrefs.com/v3/keywords-explorer";

export async function ahrefsRequest(
  endpoint: string,
  params: Record<string, string>,
  apiKey?: string
): Promise<{ data: unknown; error: string | null }> {
  const key = apiKey || process.env.AHREFS_API_KEY;
  if (!key) {
    return { data: null, error: "API Key 未配置，请在页面顶部设置您的 Ahrefs API Key" };
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000), // 30s timeout
    });

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `API error ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export interface VolumeByCountryItem {
  country: string;
  volume: number;
}

export interface VolumeByCountryResponse {
  countries: VolumeByCountryItem[];
}

export interface KeywordOverviewItem {
  keyword: string;
  country: string;
  volume: number | null;
  cpc: number | null;
  difficulty: number | null;
  clicks: number | null;
  global_volume: number | null;
}

export interface KeywordOverviewResponse {
  keywords: KeywordOverviewItem[];
}

// Returns volume map: { COUNTRYCODE: volume } (uppercase keys)
export async function getVolumeByCountry(
  keyword: string,
  apiKey?: string
): Promise<{ volumes: Record<string, number>; error: string | null }> {
  const { data, error } = await ahrefsRequest(
    "volume-by-country",
    { keyword, limit: "250" },
    apiKey
  );
  if (error || !data) return { volumes: {}, error };

  const resp = data as VolumeByCountryResponse;
  const volumes: Record<string, number> = {};
  for (const item of resp.countries ?? []) {
    // Ahrefs returns lowercase country codes; normalize to uppercase to match COUNTRY_MAP
    volumes[item.country.toUpperCase()] = item.volume ?? 0;
  }
  return { volumes, error: null };
}

export type LangVolumes = Record<string, Record<string, number>>;

/**
 * For a batch row: query each requested language's keyword for volume-by-country.
 * @param row      - raw spreadsheet row, keys like "keyword_en", "keyword_de", …
 * @param langs    - which language codes to process, e.g. ["en","de","ja"]
 * @param apiKey   - optional override (falls back to env var)
 */
export async function processKeywordRow(
  row: Record<string, string>,
  langs: string[],
  apiKey?: string
): Promise<{
  keywords: Record<string, string>;   // { en: "seo tool", de: "SEO-Tool" }
  lang_volumes: LangVolumes;          // { en: { US: 1000, … }, de: { DE: 800, … } }
}> {
  const lang_volumes: LangVolumes = {};
  const keywords: Record<string, string> = {};

  for (const lang of langs) {
    const keyword = (row[`keyword_${lang}`] ?? "").trim();
    keywords[lang] = keyword;
    if (!keyword) continue;

    const { volumes } = await getVolumeByCountry(keyword, apiKey);
    lang_volumes[lang] = volumes;

    // Rate-limit guard
    await new Promise((r) => setTimeout(r, 300));
  }

  return { keywords, lang_volumes };
}
