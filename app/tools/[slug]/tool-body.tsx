import { Suspense } from "react";
import SingleQuery from "@/app/components/SingleQuery";
import BatchQuery from "@/app/components/BatchQuery";
import EeatEvaluator from "@/app/components/EeatEvaluator";
import SlugGenerator from "@/app/components/SlugGenerator";
import SchemaBuilder from "@/app/components/SchemaBuilder";
import UiTranslator from "@/app/components/UiTranslator";

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
