import { NextRequest, NextResponse } from "next/server";
import { ahrefsRequest } from "@/lib/ahrefs";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  const country = req.nextUrl.searchParams.get("country");

  if (!keyword || !country) {
    return NextResponse.json(
      { error: "keyword and country required" },
      { status: 400 }
    );
  }

  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";

  const { data, error } = await ahrefsRequest(
    "overview",
    {
      keywords: keyword,
      country: country.toLowerCase(),
      select: "keyword,volume,global_volume,difficulty,cpc,traffic_potential,clicks,cps",
    },
    apiKey
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
