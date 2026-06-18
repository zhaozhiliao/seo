import Link from "next/link";

const COLUMNS = [
  {
    title: "内容",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "Docs" },
    ],
  },
  {
    title: "产品",
    links: [
      { href: "/tools", label: "Tools" },
      { href: "/apps", label: "Apps" },
      { href: "/settings", label: "设置" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-bg-subtle">
      <div className="mx-auto grid gap-8 px-6 py-12 sm:grid-cols-3" style={{ maxWidth: "var(--page-max)" }}>
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-[13px] font-bold text-white">W</span>
            <span className="text-sm">wikipie</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-fg-muted">
            个人站点、工具集合，以及我做的几个 App 的文档与更新日志。
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-fg-subtle">
        © {new Date().getFullYear()} wikipie · Built with Next.js & Fumadocs
      </div>
    </footer>
  );
}
