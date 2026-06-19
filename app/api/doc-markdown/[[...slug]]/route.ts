import { getDocPageMarkdown } from "@/lib/doc-markdown";

export const runtime = "nodejs";

/** Serve processed Markdown (`/api/doc-markdown/docs/foo` ← `/docs/foo.mdx`). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const docPath = slug?.length ? `/${slug.join("/")}` : "/";
  const markdown = await getDocPageMarkdown(docPath);
  if (!markdown) return new Response("Not found", { status: 404 });

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
