import { Suspense } from "react";
import SingleQuery from "@/components/tools/SingleQuery";
import BatchQuery from "@/components/tools/BatchQuery";
import EeatEvaluator from "@/components/tools/EeatEvaluator";
import SlugGenerator from "@/components/tools/SlugGenerator";
import SchemaBuilder from "@/components/tools/SchemaBuilder";
import UiTranslator from "@/components/tools/UiTranslator";

const skeleton = <div className="h-48 animate-pulse rounded-xl bg-bg-subtle" />;

/** Maps a tool slug to its interactive body. */
export function ToolBody({ slug }: { slug: string }) {
  switch (slug) {
    case "keywords":
      return (
        <div className="space-y-6">
          <Suspense fallback={skeleton}>
            <SingleQuery />
          </Suspense>
          <Suspense fallback={skeleton}>
            <BatchQuery />
          </Suspense>
        </div>
      );
    case "eeat":
      return <EeatEvaluator />;
    case "slug":
      return <SlugGenerator />;
    case "schema":
      return <SchemaBuilder />;
    case "ui-translate":
      return <UiTranslator />;
    default:
      return null;
  }
}
