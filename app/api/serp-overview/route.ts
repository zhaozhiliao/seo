import { NextRequest, NextResponse } from "next/server";
import { ahrefsRequest } from "@/lib/ahrefs";
import { COUNTRY_MAP } from "@/lib/countries";

export const runtime = "nodejs";

const SERP_BASE_URL = "https://api.ahrefs.com/v3/serp-overview";
const ALLOWED_TOP_POSITIONS = new Set([10, 20, 50, 100]);

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword")?.trim();
  const country = req.nextUrl.searchParams.get("country")?.trim().toUpperCase();
  const topPositions = Number(req.nextUrl.searchParams.get("top_positions") ?? "20");
  const date = req.nextUrl.searchParams.get("date")?.trim();

  if (!keyword || !country) {
    return NextResponse.json({ error: "关键词和国家不能为空" }, { status: 400 });
  }
  if (!COUNTRY_MAP[country]) {
    return NextResponse.json({ error: "无效的国家代码" }, { status: 400 });
  }
  if (!ALLOWED_TOP_POSITIONS.has(topPositions)) {
    return NextResponse.json({ error: "排名数量仅支持 10、20、50 或 100" }, { status: 400 });
  }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "日期格式必须为 YYYY-MM-DD" }, { status: 400 });
  }

  const params: Record<string, string> = {
    keyword,
    country: country.toLowerCase(),
    top_positions: String(topPositions),
    select:
      "position,title,url,type,page_type,domain_rating,url_rating,traffic,update_date",
  };
  if (date) params.date = `${date}T23:59:59`;

  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";
  const { data, error } = await ahrefsRequest(
    "serp-overview",
    params,
    apiKey,
    SERP_BASE_URL
  );

  if (error) return NextResponse.json({ error }, { status: 502 });
  return NextResponse.json(data);
}
