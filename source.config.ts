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

/* ── App content — one collection each, filtered by app slug in lib/content.ts.
   Relative paths look like `app1/docs/getting-started.mdx`. ── */
export const appDocs = defineCollections({
  type: "doc",
  dir: "content/apps",
  files: ["*/docs/**/*.mdx"],
  schema: appDocSchema,
});

export const appBlog = defineCollections({
  type: "doc",
  dir: "content/apps",
  files: ["*/blog/**/*.mdx"],
  schema: blogSchema,
});

export const appChangelog = defineCollections({
  type: "doc",
  dir: "content/apps",
  files: ["*/changelog.mdx"],
  schema: blogSchema,
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
