import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NextNova — Future Tech Marketplace for AI Cars, Robots & Gadgets",
    template: "%s · NextNova",
  },
  description:
    "NextNova is a futuristic technology marketplace: real AI cars, humanoid robots, robot dogs and smart gadgets you can buy today, plus officially announced upcoming launches with expected dates, specs and official links.",
  keywords: [
    "future tech marketplace",
    "AI robots for sale",
    "humanoid robot price",
    "smart gadgets 2026",
    "upcoming tech launches",
    "AI cars",
    "smart glasses",
    "robot dog",
    "nextnova",
  ],
  applicationName: "NextNova",
  authors: [{ name: "NextNova" }],
  category: "technology",
  openGraph: {
    type: "website",
    siteName: "NextNova",
    title: "NextNova — Future Tech Marketplace",
    description:
      "Real, released AI hardware and officially announced future launches — with prices, specifications and official purchase links.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextNova — Future Tech Marketplace",
    description:
      "Real, released AI hardware and officially announced future launches — with prices, specs and official links.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070f" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fc" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeBootstrap = `(function(){try{var stored=localStorage.getItem("nextnova:theme");var isDark=stored?stored==="dark":true;document.documentElement.classList.toggle("dark",isDark);}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ChatWidget />
      </body>
    </html>
  );
}
