import Link from "next/link";
import { Check, Download, ImageIcon, icons, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CANONICAL_ROOT } from "@/lib/app-url";
import { resolveAppLinks } from "@/lib/app-config-links";
import { cn } from "@/lib/utils";
import type { AppConfig, AppLanding } from "@/content/apps/app-types";
import { LandingScreenshotCarousel } from "@/components/app/landing/landing-screenshot-carousel";
import { resolveLandingScreenshots } from "@/components/app/landing/landing-screenshots";

export interface LandingThemeProps {
  app: AppConfig;
  landing: AppLanding;
}

export const DEFAULT_LANDING_THEME = "stacked" as const;

/** Resolve a lucide.dev kebab-case icon name (e.g. `bell-ring`) to its component. */
export function landingIcon(name?: string): LucideIcon {
  if (!name) return Check;
  const key = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return icons[key as keyof typeof icons] ?? Check;
}

export function resolveLandingData(app: AppConfig, landing: AppLanding) {
  const downloadHref = landing.downloadCta?.href ?? app.external?.download;
  const downloadLabel = landing.downloadCta?.label ?? "下载 App";
  const showDownload = landing.downloadCta != null || !!app.external?.download;
  const downloadDisabled = landing.downloadCta?.disabled === true || !downloadHref;
  const homeUrl = `${CANONICAL_ROOT.includes("localhost") ? "http" : "https"}://${CANONICAL_ROOT}`;
  const heroCtas = landing.heroCtas ? resolveAppLinks(landing.heroCtas, homeUrl) : [];
  return { downloadHref, downloadLabel, showDownload, downloadDisabled, heroCtas };
}

export function LandingHeroCtas({
  downloadHref,
  downloadLabel,
  showDownload,
  downloadDisabled,
  heroCtas,
}: ReturnType<typeof resolveLandingData>) {
  return (
    <div className="flex flex-wrap gap-3">
      {showDownload &&
        (downloadDisabled ? (
          <Button
            disabled
            variant="outline"
            className="cursor-not-allowed rounded-full px-5 text-fg-muted shadow-none"
            aria-disabled="true"
          >
            {downloadLabel}
          </Button>
        ) : (
          <Button
            render={<a href={downloadHref} target="_blank" rel="noreferrer" />}
            className="gap-2 rounded-full px-5"
          >
            <Download size={16} aria-hidden="true" /> {downloadLabel}
          </Button>
        ))}
      {heroCtas.map((cta) =>
        cta.external ? (
          <Button
            key={cta.href + cta.label}
            variant="outline"
            className="rounded-full px-5 shadow-none"
            render={<a href={cta.href} target="_blank" rel="noreferrer" />}
          >
            {cta.label}
          </Button>
        ) : (
          <Button
            key={cta.href + cta.label}
            variant="outline"
            className="rounded-full px-5 shadow-none"
            render={<Link href={cta.href} />}
          >
            {cta.label}
          </Button>
        )
      )}
    </div>
  );
}

export function LandingFeatures({
  landing,
  layout,
}: {
  landing: AppLanding;
  layout: "list" | "grid";
}) {
  if (!landing.features?.length) return null;

  return (
    <section>
      {landing.featuresTitle && (
        <h2
          className={cn(
            "display-headline font-semibold tracking-tight",
            layout === "list" ? "mb-6 text-xl" : "mb-2 text-xl"
          )}
        >
          {landing.featuresTitle}
        </h2>
      )}
      <ul className={cn(layout === "list" ? "space-y-4" : "grid gap-4 sm:grid-cols-2")}>
        {landing.features.map((f) => {
          const Icon = landingIcon(f.icon);
          return (
            <li key={f.title} className="flex gap-3">
              <Icon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-fg">
                <span className="font-medium">{f.title}</span>
                <span className="text-fg-muted"> &nbsp;—&nbsp; {f.desc}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LandingPricing({ landing }: { landing: AppLanding }) {
  if (!landing.plans?.length) return null;

  return (
    <section>
      {landing.pricingTitle && (
        <h2 className="display-headline text-xl font-semibold tracking-tight">{landing.pricingTitle}</h2>
      )}
      {landing.pricingSubtitle && <p className="mt-2 text-fg-muted">{landing.pricingSubtitle}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {landing.plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col rounded-xl border bg-bg-card p-6 shadow-sm",
              plan.featured ? "border-brand" : "border-border"
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-lg font-semibold">{plan.name}</span>
              <span className="text-fg-muted">{plan.price}</span>
              {plan.note && <span className="text-sm text-fg-subtle">· {plan.note}</span>}
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-fg-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {plan.cta && (
              <Button
                variant={plan.featured ? "default" : "outline"}
                className="mt-6 w-full"
                render={<a href={plan.cta.href} target="_blank" rel="noreferrer" />}
              >
                {plan.cta.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Full-bleed screenshot for stacked theme — aligns with hero text column. */
export function LandingScreenshotBleed({ app, landing }: LandingThemeProps) {
  const images = resolveLandingScreenshots(landing.screenshot);

  return (
    <section className="mt-12">
      {images.length ? (
        <LandingScreenshotCarousel
          images={images}
          alt={`${app.name} 产品截图`}
          imageAlign="left"
          priority
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-card text-fg-subtle">
          <span className="flex items-center gap-2 text-sm">
            <ImageIcon size={16} aria-hidden="true" /> 产品截图占位
          </span>
        </div>
      )}
    </section>
  );
}

/** Card-wrapped screenshot for split theme grid column. */
export function LandingScreenshotCard({ app, landing }: LandingThemeProps) {
  const images = resolveLandingScreenshots(landing.screenshot);

  return (
    <figure>
      {images.length ? (
        <LandingScreenshotCarousel
          images={images}
          alt={`${app.name} 产品截图`}
          priority
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-card text-fg-subtle">
          <span className="flex items-center gap-2 text-sm">
            <ImageIcon size={16} aria-hidden="true" /> 产品截图占位
          </span>
        </div>
      )}
    </figure>
  );
}
