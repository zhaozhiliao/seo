import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";

/** Personal docs tree (sidebar + page lookups) at /docs. */
export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
