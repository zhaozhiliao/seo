import { NextRequest, NextResponse } from "next/server";
import { ahrefsRequest } from "@/lib/ahrefs";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ error: "keyword required" }, { status: 400 });
  }

  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";

  const { data, error } = await ahrefsRequest(
    "volume-by-country",
    { keyword, limit: "250" },
    apiKey
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
