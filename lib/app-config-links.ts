import type { AppFooterLink } from "@/content/apps/app-types";
import type { FooterLink } from "@/components/footer/footer-columns";

/** Resolve App config links. `@wikipie` → personal site root URL. */
export function resolveAppLinks(links: AppFooterLink[], homeUrl: string): FooterLink[] {
  return links.map((l) => {
    if (l.href === "@wikipie") {
      return { href: homeUrl, label: l.label, external: true };
    }
    const external = l.external ?? l.href.startsWith("http");
    return { href: l.href, label: l.label, external };
  });
}
