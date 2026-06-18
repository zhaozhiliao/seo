import type { ComponentType } from "react";
import { MDXContent } from "@/components/mdx/mdx-content";

/** Renders a changelog MDX body inside the prose container. The MDX itself
    organizes versions with `## vX.Y.Z` headings. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChangelogList({ body }: { body: ComponentType<any> }) {
  return (
    <div className="relative border-l border-border pl-6">
      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
      <MDXContent body={body} />
    </div>
  );
}
