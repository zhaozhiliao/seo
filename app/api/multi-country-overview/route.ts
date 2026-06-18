import { NextRequest, NextResponse } from "next/server";
import { ahrefsRequest } from "@/lib/ahrefs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { keyword, countries } = body as {
    keyword: string;
    countries: string[];
  };

  if (!keyword || !countries?.length) {
    return NextResponse.json(
      { error: "keyword and countries required" },
      { status: 400 }
    );
  }

  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";
  const results: Record<string, unknown> = {};

  for (const country of countries) {
    const { data, error } = await ahrefsRequest(
      "overview",
      {
        keywords: keyword,
        country: country.toLowerCase(),
        select: "keyword,volume,difficulty,cpc,traffic_potential",
      },
      apiKey
    );
    results[country] = error ? { error } : data;
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({ results });
}
