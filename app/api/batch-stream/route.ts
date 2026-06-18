import { NextRequest } from "next/server";
import { processKeywordRow } from "@/lib/ahrefs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    rows: Record<string, string>[];
    langs: string[];
  };
  const { rows, langs } = body;
  const apiKey = req.headers.get("x-ahrefs-key") || process.env.AHREFS_API_KEY || "";

  if (!Array.isArray(rows) || !Array.isArray(langs) || langs.length === 0) {
    return new Response(JSON.stringify({ error: "rows and langs are required" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const total = rows.length;

      for (let i = 0; i < rows.length; i++) {
        try {
          const result = await processKeywordRow(rows[i], langs, apiKey);
          const payload = JSON.stringify({ ...result, index: i, total, error: null });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (e) {
          // Build keywords map even on error
          const keywords: Record<string, string> = {};
          for (const lang of langs) {
            keywords[lang] = rows[i][`keyword_${lang}`] ?? "";
          }
          const payload = JSON.stringify({
            keywords,
            lang_volumes: {},
            index: i,
            total,
            error: String(e),
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
