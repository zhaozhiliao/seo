import Image from "next/image";
import Link from "next/link";
import { Download, Check, ImageIcon, icons, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app/app-logo";
import { GridDevOverlay } from "@/components/app/grid-dev-overlay";
import { CANONICAL_ROOT } from "@/lib/app-url";
import { resolveAppLinks } from "@/lib/app-config-links";
import { cn } from "@/lib/utils";
import type { AppConfig, AppLanding as Landing } from "@/content/apps/app-types";

/** Resolve a lucide.dev kebab-case icon name (e.g. `bell-ring`) to its component. */
function landingIcon(name?: string): LucideIcon {
  if (!name) return Check;
  const key = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return icons[key as keyof typeof icons] ?? Check;
}

/** Marketing landing for an App's home. Copy and media from `landing` in apps.config. */
export function AppLanding({ app, landing }: { app: AppConfig; landing: Landing }) {
  const dl = landing.downloadCta?.href ?? app.external?.download ?? "#";
  const downloadLabel = landing.downloadCta?.label ?? "下载 App";
  const homeUrl = `${CANONICAL_ROOT.includes("localhost") ? "http" : "https"}://${CANONICAL_ROOT}`;
  const heroCtas = landing.heroCtas ? resolveAppLinks(landing.heroCtas, homeUrl) : [];

  return (
    <Container width="page" className="py-12 sm:py-16">
      <div className="grid-page-shell">
        <div className="grid-page">
        {/* Hero + screenshot */}
        <div className="grid-band">
          <div className="landing-col-hero">
            <AppLogo app={app} size="xl" className="mb-6" />
            <h1 className="display-headline text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {landing.headline ?? app.name}
            </h1>
            {landing.subhead && (
              <p className="mt-4 max-w-xl text-pretty text-base text-fg-muted sm:text-lg">{landing.subhead}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button render={<a href={dl} target="_blank" rel="noreferrer" />} className="gap-2 rounded-full px-5">
                <Download size={16} /> {downloadLabel}
              </Button>
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
          </div>

          <figure className="landing-col-media mt-10 lg:mt-0">
            {landing.screenshot ? (
              <Image
                src={landing.screenshot}
                alt={`${app.name} 产品截图`}
                width={1200}
                height={750}
                className="h-auto w-full rounded-xl border border-border shadow-sm"
                priority
              />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-dashed border-border-strong bg-bg-card text-fg-subtle">
                <span className="flex items-center gap-2 text-sm">
                  <ImageIcon size={16} /> 产品截图占位
                </span>
              </div>
            )}
          </figure>
        </div>

        {/* Features */}
        {landing.features?.length ? (
          <div className="grid-band pt-8">
            {landing.featuresTitle && (
              <h2 className="display-headline landing-col-full mb-2 text-xl font-semibold tracking-tight">{landing.featuresTitle}</h2>
            )}
            <ul className="landing-col-full grid gap-4 sm:grid-cols-2">
              {landing.features.map((f) => {
                const Icon = landingIcon(f.icon);
                return (
                  <li key={f.title} className="flex gap-3">
                    <Icon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                    <p className="text-fg">
                      <span className="font-medium">{f.title}</span>
                      <span className="text-fg-muted"> &nbsp;—&nbsp; {f.desc}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* Pricing */}
        {landing.plans?.length ? (
          <div className="grid-band pt-8">
            <div className="landing-col-full">
              {landing.pricingTitle && (
                <h2 className="display-headline text-xl font-semibold tracking-tight">{landing.pricingTitle}</h2>
              )}
              {landing.pricingSubtitle && <p className="mt-2 text-fg-muted">{landing.pricingSubtitle}</p>}
            </div>

            <div className="landing-col-full mt-2 grid gap-4 sm:grid-cols-2">
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
                        <Check size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden />
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
          </div>
        ) : null}
        </div>
        <GridDevOverlay />
      </div>
    </Container>
  );
}
