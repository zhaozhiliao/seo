import { NextResponse, type NextRequest } from "next/server";
import { ROOT_DOMAINS } from "@/lib/app-url";

/**
 * Subdomain routing: each App is its own site at `<slug>.<root>`. This rewrites
 * `<slug>.<root>/<path>` to the internal `/apps/<slug>/<path>` route. The bare
 * root domain (and www) serves the personal site untouched. Root domains come
 * from NEXT_PUBLIC_ROOT_DOMAIN (comma-separated; e.g. wikipie.com,piezora.cn).
 *
 * Docs Markdown export: `/docs/foo.mdx` → `/api/doc-markdown?path=…`
 */
export function middleware(req: NextRequest) {
  const hostname = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  const url = req.nextUrl.clone();
  let pathname = url.pathname;
  let rewritten = false;

  for (const root of ROOT_DOMAINS) {
    const rootHost = root.split(":")[0];
    if (hostname === rootHost || hostname === `www.${rootHost}`) break;

    if (hostname.endsWith(`.${rootHost}`)) {
      const sub = hostname.slice(0, hostname.length - rootHost.length - 1);
      if (sub && sub !== "www" && !pathname.startsWith(`/apps/${sub}`)) {
        pathname = `/apps/${sub}${pathname === "/" ? "" : pathname}`;
        url.pathname = pathname;
        rewritten = true;
      }
      break;
    }
  }

  if (pathname.endsWith(".mdx") && /\/docs(?:\/|$)/.test(pathname.slice(0, -4))) {
    url.pathname = `/api/doc-markdown${pathname.slice(0, -4)}`;
    return NextResponse.rewrite(url);
  }

  if (rewritten) return NextResponse.rewrite(url);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/((?:apps/[^/]+/)?docs(?:/.*)?)\\.mdx",
  ],
};
