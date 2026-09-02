import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatMount } from "@/components/ChatMount";
import { SITE } from "@/content/site";
import "./globals.css";

/* One Roboto family across the site. Hierarchy comes from weight and tracking
   rather than from mixing typefaces, so headings stay distinctly heavy. */
const display = Roboto({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700", "900"],
});

const body = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500"],
});

const utility = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-utility",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crementum.org"),
  title: {
    default: `${SITE.name} — Free 1-on-1 Tutoring`,
    template: `%s — ${SITE.name}`,
  },
  description: "Free peer tutoring in Math, Science, Humanities & Speech. Book anytime.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${utility.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ChatMount />
      </body>
    </html>
  );
}
