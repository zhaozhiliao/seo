import Link from "next/link";
import { FooterLinkColumn, FooterShell } from "@/components/footer/footer-columns";

const PAGE_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
  { href: "/tools", label: "Tools" },
  { href: "/apps", label: "Apps" },
];

const MORE_LINKS = [{ href: "/settings", label: "设置" }];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <FooterShell
      brand={
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-[13px] font-bold text-white">
            W
          </span>
          <span className="text-sm">wikipie</span>
        </Link>
      }
      copyright={`© ${year} wikipie`}
      columns={
        <>
          <FooterLinkColumn title="Pages" links={PAGE_LINKS} />
          <FooterLinkColumn title="More" links={MORE_LINKS} />
        </>
      }
    />
  );
}
