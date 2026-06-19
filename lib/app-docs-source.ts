import { loader } from "fumadocs-core/source";
import { whatermindDocs } from "@/.source/server";

/** Per-App docs loaders (Fumadocs page tree). Add one entry per `defineDocs` export. */
const APP_DOCS = {
  whatermind: loader({
    baseUrl: "/docs",
    source: whatermindDocs.toFumadocsSource(),
  }),
} as const;

export type AppDocsSource = (typeof APP_DOCS)[keyof typeof APP_DOCS];

export function getAppDocsSource(app: string): AppDocsSource | undefined {
  return APP_DOCS[app as keyof typeof APP_DOCS];
}

export function appHasDocs(app: string): boolean {
  const src = getAppDocsSource(app);
  return src ? src.getPages().length > 0 : false;
}
