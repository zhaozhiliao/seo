import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/footer/site-footer";
import { ApiKeyProvider } from "@/components/context/ApiKeyContext";
import { AiKeysProvider } from "@/components/context/AiKeysContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://wikipie.com"),
  title: {
    default: "wikipie — 个人站点 · 工具集 · App 文档",
    template: "%s · wikipie",
  },
  description: "wikipie 的个人站点：博客、文档、SEO 工具集合，以及多个 App 的介绍、文档与更新日志。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          跳到主要内容
        </a>
        <ThemeProvider>
          <ApiKeyProvider>
            <AiKeysProvider>
              <div className="flex min-h-screen flex-col">
                <SiteNav />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <SiteFooter />
              </div>
            </AiKeysProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
