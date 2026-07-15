import { NextRequest, NextResponse } from "next/server";
import { ahrefsRequest } from "@/lib/ahrefs";
import { COUNTRY_MAP } from "@/lib/countries";

export const runtime = "nodejs";

const MAX_LIMIT = 150_000;
const MATCH_MODES = new Set(["terms", "phrase"]);
const TERM_TYPES = new Set(["all", "questions"]);

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword")?.trim();
  const country = req.nextUrl.searchParams.get("country")?.trim().toUpperCase();
  const rawLimit = req.nextUrl.searchParams.get("limit") ?? "20";
  const matchMode = req.nextUrl.searchParams.get("match_mode") ?? "terms";
  const termType = req.nextUrl.searchParams.get("terms") ?? "all";
  const limit = Number(rawLimit);

  if (!keyword || !country) {
    return NextResponse.json({ error: "关键词和国家不能为空" }, { status: 400 });
  }
  if (!COUNTRY_MAP[country]) {
    return NextResponse.json({ error: "无效的国家代码" }, { status: 400 });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return NextResponse.json(
      { error: `返回数量必须是 1–${MAX_LIMIT.toLocaleString()} 的整数` },
      { status: 400 }
    );
  }
  if (!MATCH_MODES.has(matchMode)) {
    return NextResponse.json({ error: "不支持的匹配模式" }, { status: 400 });
  }
  if (!TERM_TYPES.has(termType)) {
    return NextResponse.json({ error: "不支持的关键词类型" }, { status: 400 });
  }

  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";
  const { data, error } = await ahrefsRequest(
    "matching-terms",
    {
      keywords: keyword,
      country: country.toLowerCase(),
      limit: String(limit),
      match_mode: matchMode,
      terms: termType,
      order_by: "volume:desc",
      select:
        "keyword,volume,global_volume,difficulty,cpc,traffic_potential,intents,parent_topic",
    },
    apiKey
  );

  if (error) return NextResponse.json({ error }, { status: 502 });
  return NextResponse.json(data);
}
