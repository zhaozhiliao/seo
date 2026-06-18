import { defineDocs, defineCollections, defineConfig, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

/* Shared frontmatter for blog-style entries (personal + app). */
const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
});

/* App docs frontmatter — keep `order` for sidebar sorting. */
const appDocSchema = frontmatterSchema.extend({
  order: z.number().optional(),
});

/* ── Personal docs (with page tree via meta.json) ── */
export const docs = defineDocs({
  dir: "content/docs",
});

/* ── Personal blog ── */
export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: blogSchema,
});

/* ── App content — a single docs collection per App, filtered by app slug in
   lib/content.ts. Changelog lives inside the docs tree. Relative paths look
   like `app1/docs/getting-started.mdx`. ── */
export const appDocs = defineCollections({
  type: "doc",
  dir: "content/apps",
  files: ["*/docs/**/*.mdx"],
  schema: appDocSchema,
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
