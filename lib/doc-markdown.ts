import { docsSource } from "@/lib/source";
import { getAppDocsSource } from "@/lib/app-docs-source";

type DocPage = {
  absolutePath: string;
  data: { getText?: (type: "raw" | "processed") => Promise<string> };
};

/** Resolve a docs page from its public URL path (e.g. `/docs/privacy`, `/apps/whatermind/docs`). */
export function getDocPageByPath(docPath: string): DocPage | undefined {
  const appMatch = docPath.match(/^\/apps\/([^/]+)\/docs(?:\/(.*))?$/);
  if (appMatch) {
    const slugs = appMatch[2] ? appMatch[2].split("/") : [];
    return getAppDocsSource(appMatch[1])?.getPage(slugs) as DocPage | undefined;
  }
  if (docPath === "/docs" || docPath.startsWith("/docs/")) {
    const slugs = docPath === "/docs" ? undefined : docPath.slice("/docs/".length).split("/");
    return docsSource.getPage(slugs) as DocPage | undefined;
  }
  return undefined;
}

export async function getDocPageMarkdown(docPath: string): Promise<string | undefined> {
  const page = getDocPageByPath(docPath);
  if (!page?.data.getText) return undefined;
  return page.data.getText("processed");
}

/** Public `.mdx` URL for a docs page (served via middleware → `/api/doc-markdown`). */
export function docMarkdownUrl(pageUrl: string) {
  return `${pageUrl}.mdx`;
}

const GITHUB = {
  owner: "zhaozhiliao",
  repo: "seo_keywords",
  branch: "main",
};

/** GitHub blob URL for the MDX source file. */
export function docGithubUrl(absolutePath: string | undefined) {
  if (!absolutePath) return undefined;
  const marker = "/ahrefs-next/";
  const idx = absolutePath.indexOf(marker);
  const rel = idx >= 0 ? absolutePath.slice(idx + marker.length) : absolutePath;
  return `https://github.com/${GITHUB.owner}/${GITHUB.repo}/blob/${GITHUB.branch}/${rel}`;
}
