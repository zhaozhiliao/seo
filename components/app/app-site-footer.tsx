import Link from "next/link";
import { CANONICAL_ROOT } from "@/lib/app-url";
import { resolveAppLinks } from "@/lib/app-config-links";
import { AppLogo } from "@/components/app/app-logo";
import { FooterLinkColumn, FooterShell } from "@/components/footer/footer-columns";
import type { AppConfig } from "@/lib/apps";

/** Footer for an App's own site — layout shared; link columns from `app.footer` in apps.config. */
export function AppSiteFooter({ app }: { app: AppConfig }) {
  const year = new Date().getFullYear();
  const homeUrl = `${CANONICAL_ROOT.includes("localhost") ? "http" : "https"}://${CANONICAL_ROOT}`;
  const copyrightName = app.footer.copyrightName ?? app.name;

  return (
    <FooterShell
      brand={
        <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
          <AppLogo app={app} size="sm" />
          <span className="text-sm font-semibold tracking-tight">{app.name}</span>
        </Link>
      }
      copyright={`© ${year} ${copyrightName}`}
      columns={
        <>
          {app.footer.columns.map((col) => (
            <FooterLinkColumn
              key={col.title}
              title={col.title}
              links={resolveAppLinks(col.links, homeUrl)}
            />
          ))}
        </>
      }
    />
  );
}
